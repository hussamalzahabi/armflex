<?php

namespace App\Services;

use App\Models\Exercise;
use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProgramGeneratorService
{
    private const PROGRAM_DURATION_WEEKS = 4;

    private const SINGLE_EQUIPMENT_COUNT = 1;

    private const SIMPLICITY_BONUS_SCORE = 1;

    private const MAX_CATEGORY_APPEARANCES_PER_DAY = 1;

    private const MAX_WEEKLY_EXERCISE_REPEATS = 2;

    private const STYLE_PHASE_EXACT = 1;

    private const STYLE_PHASE_FLEXIBLE = 2;

    private const STYLE_PHASE_FALLBACK = 3;

    private const HOLD_OR_ISOMETRIC_SETS = 3;

    private const HOLD_OR_ISOMETRIC_REPS = '10-20 sec';

    private const PRIMARY_EXERCISE_SETS = 4;

    private const PRIMARY_EXERCISE_REPS = '6-8';

    private const SUPPORT_EXERCISE_SETS = 3;

    private const SUPPORT_EXERCISE_REPS = '10-15';

    public function __construct(private readonly ProgramGenerationRules $rules) {}

    public function generateForUser(int $userId): Program
    {
        $user = User::query()
            ->with(['profile.style', 'equipments:id'])
            ->findOrFail($userId);

        $profile = $user->profile;
        $errors = [];

        if ($profile === null) {
            $errors['profile'] = 'Complete your training profile before generating a program.';
        } else {
            if (! $profile->style_id || $profile->style === null) {
                $errors['style_id'] = 'Select a style before generating a program.';
            }

            if (! $profile->training_days_per_week) {
                $errors['training_days_per_week'] = 'Set your training days per week before generating a program.';
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        $styleSlug = (string) $profile->style->slug;
        $experienceLevel = (string) $profile->experience_level;
        $generatedDays = $this->rules->generatedDaysCount((int) $profile->training_days_per_week);
        $userEquipmentIds = $user->equipments
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->sort()
            ->values()
            ->all();
        $profileSignature = $this->buildProfileSignature(
            (string) $profile->dominant_arm,
            $styleSlug,
            $experienceLevel,
            (float) $profile->weight_kg,
            $generatedDays,
            $userEquipmentIds
        );

        $eligibleExercises = $this->getEligibleExercises($userEquipmentIds, $experienceLevel);

        if ($eligibleExercises->isEmpty()) {
            throw ValidationException::withMessages([
                'equipment_ids' => 'No eligible exercises were found for your equipment and experience level.',
            ]);
        }

        $scoredExercises = $this->scoreExercises(
            $eligibleExercises,
            $styleSlug,
            $experienceLevel,
            $user->id
        );
        $exercisesPerDay = $this->rules->exercisesPerDayCount($generatedDays);
        $weeklyTemplate = $this->distributeExercisesIntoDays(
            $scoredExercises,
            $styleSlug,
            $generatedDays,
            $exercisesPerDay
        );
        $programSignature = $this->buildProgramSignature($weeklyTemplate);

        $existingProgram = $this->findExistingProgram(
            $user->id,
            $profileSignature,
            $programSignature
        );

        if ($existingProgram !== null) {
            $existingProgram->setAttribute('was_reused', true);

            return $existingProgram;
        }

        return DB::transaction(function () use (
            $user,
            $styleSlug,
            $experienceLevel,
            $generatedDays,
            $weeklyTemplate,
            $profileSignature,
            $programSignature
        ): Program {
            $program = $user->programs()->create([
                'name' => $this->rules->buildProgramName($styleSlug, $experienceLevel),
                'style' => $styleSlug,
                'experience_level' => $experienceLevel,
                'training_days' => $generatedDays,
                'duration_weeks' => self::PROGRAM_DURATION_WEEKS,
                'profile_signature' => $profileSignature,
                'program_signature' => $programSignature,
            ]);

            foreach ($weeklyTemplate as $dayNumber => $exerciseRows) {
                $programDay = $program->days()->create([
                    'day_number' => $dayNumber,
                ]);

                foreach ($exerciseRows as $row) {
                    $programDay->exercises()->create([
                        'exercise_id' => $row['exercise_id'],
                        'order_index' => $row['order_index'],
                        'sets' => $row['sets'],
                        'reps' => $row['reps'],
                        'notes' => $row['notes'],
                    ]);
                }
            }

            $program->setAttribute('was_reused', false);

            return $program->load([
                'days.exercises.exercise.category',
                'days.exercises.exercise.styles',
                'days.exercises.exercise.equipments',
            ]);
        });
    }

    /**
     * @return EloquentCollection<int, Exercise>
     */
    private function getEligibleExercises(array $userEquipmentIds, string $experienceLevel): EloquentCollection
    {
        $userEquipmentLookup = array_fill_keys($userEquipmentIds, true);

        return Exercise::query()
            ->where('is_active', true)
            ->with(['category:id,slug', 'styles:id,slug', 'equipments:id'])
            ->get()
            ->filter(function (Exercise $exercise) use ($userEquipmentLookup, $experienceLevel): bool {
                if (! $this->rules->isDifficultyAllowed($experienceLevel, $exercise->difficulty_level)) {
                    return false;
                }

                $requiredEquipmentIds = $exercise->equipments
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all();

                foreach ($requiredEquipmentIds as $equipmentId) {
                    if (! isset($userEquipmentLookup[$equipmentId])) {
                        return false;
                    }
                }

                return true;
            })
            ->values();
    }

    /**
     * @param  EloquentCollection<int, Exercise>  $eligibleExercises
     * @return Collection<int, array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }>
     */
    private function scoreExercises(
        EloquentCollection $eligibleExercises,
        string $styleSlug,
        string $experienceLevel,
        int $userId
    ): Collection {
        return $eligibleExercises
            ->map(function (Exercise $exercise) use ($styleSlug, $experienceLevel, $userId): array {
                $categorySlug = $exercise->category?->slug;
                $styleSlugs = $exercise->styles->pluck('slug')->map(fn ($slug) => (string) $slug)->all();
                $requiredEquipmentCount = $exercise->equipments->count();
                $score = 0;
                $score += $this->rules->categoryScoreForStyle($styleSlug, $categorySlug);
                $score += $this->rules->styleTagScore($styleSlug, $styleSlugs);
                $score += $this->rules->difficultyFitScore($experienceLevel, $exercise->difficulty_level);

                if ($requiredEquipmentCount === self::SINGLE_EQUIPMENT_COUNT) {
                    $score += self::SIMPLICITY_BONUS_SCORE;
                }

                return [
                    'exercise' => $exercise,
                    'category_slug' => $categorySlug,
                    'style_slugs' => $styleSlugs,
                    'style_phase' => $this->stylePhase($styleSlug, $styleSlugs),
                    'score' => $score,
                    'tie_breaker' => $this->userTieBreaker($userId, (int) $exercise->id),
                ];
            })
            ->sort(function (array $left, array $right): int {
                $scoreComparison = $right['score'] <=> $left['score'];
                if ($scoreComparison !== 0) {
                    return $scoreComparison;
                }

                $tieBreakerComparison = $left['tie_breaker'] <=> $right['tie_breaker'];
                if ($tieBreakerComparison !== 0) {
                    return $tieBreakerComparison;
                }

                return $left['exercise']->id <=> $right['exercise']->id;
            })
            ->values();
    }

    /**
     * @param  Collection<int, array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }>  $scoredExercises
     * @return array<int, list<array{
     *     exercise_id: int,
     *     order_index: int,
     *     sets: int,
     *     reps: string,
     *     notes: string|null
     * }>>
     */
    private function distributeExercisesIntoDays(
        Collection $scoredExercises,
        string $styleSlug,
        int $daysCount,
        int $exercisesPerDay
    ): array {
        $weeklyUsage = [];
        $dayCategoryUsage = [];
        $days = [];

        for ($dayNumber = 1; $dayNumber <= $daysCount; $dayNumber++) {
            $dayCategoryUsage[$dayNumber] = [];
            $days[$dayNumber] = [];

            for ($slot = 1; $slot <= $exercisesPerDay; $slot++) {
                $selected = $this->pickExerciseForSlot(
                    $scoredExercises,
                    $dayCategoryUsage[$dayNumber],
                    $weeklyUsage
                );

                if ($selected === null) {
                    break;
                }

                $exerciseId = (int) $selected['exercise']->id;
                $categorySlug = $selected['category_slug'];
                $prescription = $this->prescriptionForExercise($selected, $styleSlug);

                $days[$dayNumber][] = [
                    'exercise_id' => $exerciseId,
                    'order_index' => $slot,
                    'sets' => $prescription['sets'],
                    'reps' => $prescription['reps'],
                    'notes' => null,
                ];

                $weeklyUsage[$exerciseId] = ($weeklyUsage[$exerciseId] ?? 0) + 1;

                if ($categorySlug !== null) {
                    $dayCategoryUsage[$dayNumber][$categorySlug] = ($dayCategoryUsage[$dayNumber][$categorySlug] ?? 0) + 1;
                }
            }
        }

        return $days;
    }

    /**
     * @param  Collection<int, array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }>  $scoredExercises
     * @param  array<string, int>  $dayCategoryUsage
     * @param  array<int, int>  $weeklyUsage
     * @return array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }|null
     */
    private function pickExerciseForSlot(
        Collection $scoredExercises,
        array $dayCategoryUsage,
        array $weeklyUsage
    ): ?array {
        if ($scoredExercises->isEmpty()) {
            return null;
        }

        // Fill each slot by starting with the strictest, cleanest match first,
        // then relaxing style, repeat, and category constraints only when needed.
        foreach ($this->slotSelectionPasses() as $pass) {
            $candidate = $scoredExercises
                ->filter(fn (array $item): bool => $this->matchesSelectionPass(
                    $item,
                    $pass,
                    $dayCategoryUsage,
                    $weeklyUsage
                ))
                ->sort(function (array $left, array $right) use ($weeklyUsage): int {
                    $scoreComparison = $right['score'] <=> $left['score'];
                    if ($scoreComparison !== 0) {
                        return $scoreComparison;
                    }

                    $tieBreakerComparison = $left['tie_breaker'] <=> $right['tie_breaker'];
                    if ($tieBreakerComparison !== 0) {
                        return $tieBreakerComparison;
                    }

                    $leftUsage = $weeklyUsage[(int) $left['exercise']->id] ?? 0;
                    $rightUsage = $weeklyUsage[(int) $right['exercise']->id] ?? 0;
                    $usageComparison = $leftUsage <=> $rightUsage;
                    if ($usageComparison !== 0) {
                        return $usageComparison;
                    }

                    return $left['exercise']->id <=> $right['exercise']->id;
                })
                ->first();

            if ($candidate !== null) {
                return $candidate;
            }
        }

        /** @var array{
         *     exercise: Exercise,
         *     category_slug: string|null,
         *     style_slugs: list<string>,
         *     style_phase: int,
         *     score: int,
         *     tie_breaker: int
         * } $fallback
         */
        $fallback = $scoredExercises->first();

        return $fallback;
    }

    /**
     * @param  array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }  $scoredExercise
     * @return array{sets: int, reps: string}
     */
    private function prescriptionForExercise(array $scoredExercise, string $styleSlug): array
    {
        $exercise = $scoredExercise['exercise'];
        $name = strtolower($exercise->name);

        if (str_contains($name, 'hold') || str_contains($name, 'isometric')) {
            return [
                'sets' => self::HOLD_OR_ISOMETRIC_SETS,
                'reps' => self::HOLD_OR_ISOMETRIC_REPS,
            ];
        }

        if ($this->rules->isPrimaryCategory($styleSlug, $scoredExercise['category_slug'])) {
            return [
                'sets' => self::PRIMARY_EXERCISE_SETS,
                'reps' => self::PRIMARY_EXERCISE_REPS,
            ];
        }

        return [
            'sets' => self::SUPPORT_EXERCISE_SETS,
            'reps' => self::SUPPORT_EXERCISE_REPS,
        ];
    }

    /**
     * @param  list<string>  $exerciseStyleSlugs
     */
    private function stylePhase(string $userStyleSlug, array $exerciseStyleSlugs): int
    {
        if ($exerciseStyleSlugs === []) {
            return self::STYLE_PHASE_EXACT;
        }

        $normalized = array_map(static fn (string $slug): string => strtolower(trim($slug)), $exerciseStyleSlugs);
        $userStyleSlug = strtolower(trim($userStyleSlug));

        if (in_array($userStyleSlug, $normalized, true)) {
            return self::STYLE_PHASE_EXACT;
        }

        if (in_array('mixed', $normalized, true) || in_array('general', $normalized, true)) {
            return self::STYLE_PHASE_FLEXIBLE;
        }

        return self::STYLE_PHASE_FALLBACK;
    }

    /**
     * @return list<array{
     *     phases: list<int>,
     *     max_repeat: int|null,
     *     enforce_category_uniqueness: bool
     * }>
     */
    private function slotSelectionPasses(): array
    {
        return [
            [
                'phases' => [self::STYLE_PHASE_EXACT],
                'max_repeat' => self::MAX_WEEKLY_EXERCISE_REPEATS,
                'enforce_category_uniqueness' => true,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE],
                'max_repeat' => self::MAX_WEEKLY_EXERCISE_REPEATS,
                'enforce_category_uniqueness' => true,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE],
                'max_repeat' => null,
                'enforce_category_uniqueness' => true,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE],
                'max_repeat' => null,
                'enforce_category_uniqueness' => false,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE, self::STYLE_PHASE_FALLBACK],
                'max_repeat' => self::MAX_WEEKLY_EXERCISE_REPEATS,
                'enforce_category_uniqueness' => true,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE, self::STYLE_PHASE_FALLBACK],
                'max_repeat' => null,
                'enforce_category_uniqueness' => true,
            ],
            [
                'phases' => [self::STYLE_PHASE_EXACT, self::STYLE_PHASE_FLEXIBLE, self::STYLE_PHASE_FALLBACK],
                'max_repeat' => null,
                'enforce_category_uniqueness' => false,
            ],
        ];
    }

    /**
     * @param  array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int,
     *     tie_breaker: int
     * }  $item
     * @param  array{
     *     phases: list<int>,
     *     max_repeat: int|null,
     *     enforce_category_uniqueness: bool
     * }  $pass
     * @param  array<string, int>  $dayCategoryUsage
     * @param  array<int, int>  $weeklyUsage
     */
    private function matchesSelectionPass(
        array $item,
        array $pass,
        array $dayCategoryUsage,
        array $weeklyUsage
    ): bool {
        if (! in_array($item['style_phase'], $pass['phases'], true)) {
            return false;
        }

        $exerciseId = (int) $item['exercise']->id;
        $currentWeeklyUsage = $weeklyUsage[$exerciseId] ?? 0;

        if (is_int($pass['max_repeat']) && $currentWeeklyUsage >= $pass['max_repeat']) {
            return false;
        }

        if (
            $pass['enforce_category_uniqueness']
            && $item['category_slug'] !== null
        ) {
            $categoryUsage = $dayCategoryUsage[$item['category_slug']] ?? 0;

            if ($categoryUsage >= self::MAX_CATEGORY_APPEARANCES_PER_DAY) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, list<array{
     *     exercise_id: int,
     *     order_index: int,
     *     sets: int,
     *     reps: string,
     *     notes: string|null
     * }>>  $weeklyTemplate
     */
    private function buildProgramSignature(array $weeklyTemplate): string
    {
        return hash('sha256', (string) json_encode($weeklyTemplate));
    }

    /**
     * @param  list<int>  $equipmentIds
     */
    private function buildProfileSignature(
        string $dominantArm,
        string $styleSlug,
        string $experienceLevel,
        float $bodyWeightKg,
        int $generatedDays,
        array $equipmentIds
    ): string {
        $parts = [
            strtolower(trim($dominantArm)),
            strtolower(trim($styleSlug)),
            strtolower(trim($experienceLevel)),
            number_format($bodyWeightKg, 2, '.', ''),
            (string) $generatedDays,
            implode(',', $equipmentIds),
        ];

        return hash('sha256', implode('|', $parts));
    }

    private function userTieBreaker(int $userId, int $exerciseId): int
    {
        return (int) sprintf('%u', crc32($userId.':'.$exerciseId));
    }

    private function findExistingProgram(
        int $userId,
        string $profileSignature,
        string $programSignature
    ): ?Program {
        $program = Program::query()
            ->where('user_id', $userId)
            ->where('profile_signature', $profileSignature)
            ->where('program_signature', $programSignature)
            ->latest('id')
            ->first();

        if ($program === null) {
            return null;
        }

        return $program->load([
            'days.exercises.exercise.category',
            'days.exercises.exercise.styles',
            'days.exercises.exercise.equipments',
        ]);
    }
}
