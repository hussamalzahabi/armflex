<?php

namespace App\Services;

use App\Models\Exercise;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProgramGeneratorService
{
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
        $userEquipmentIds = $user->equipments->pluck('id')->map(fn ($id) => (int) $id)->all();
        $eligibleExercises = $this->getEligibleExercises($userEquipmentIds, $experienceLevel);

        if ($eligibleExercises->isEmpty()) {
            throw ValidationException::withMessages([
                'equipment_ids' => 'No eligible exercises were found for your equipment and experience level.',
            ]);
        }

        $scoredExercises = $this->scoreExercises($eligibleExercises, $styleSlug, $experienceLevel);
        $generatedDays = $this->rules->generatedDaysCount((int) $profile->training_days_per_week);
        $exercisesPerDay = $this->rules->exercisesPerDayCount($generatedDays);
        $weeklyTemplate = $this->distributeExercisesIntoDays(
            $scoredExercises,
            $styleSlug,
            $generatedDays,
            $exercisesPerDay
        );

        return DB::transaction(function () use (
            $user,
            $styleSlug,
            $experienceLevel,
            $generatedDays,
            $weeklyTemplate
        ): Program {
            $program = $user->programs()->create([
                'name' => $this->rules->buildProgramName($styleSlug, $experienceLevel),
                'style' => $styleSlug,
                'experience_level' => $experienceLevel,
                'training_days' => $generatedDays,
                'duration_weeks' => 4,
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
     *     score: int
     * }>
     */
    private function scoreExercises(
        EloquentCollection $eligibleExercises,
        string $styleSlug,
        string $experienceLevel
    ): Collection {
        return $eligibleExercises
            ->map(function (Exercise $exercise) use ($styleSlug, $experienceLevel): array {
                $categorySlug = $exercise->category?->slug;
                $styleSlugs = $exercise->styles->pluck('slug')->map(fn ($slug) => (string) $slug)->all();
                $requiredEquipmentCount = $exercise->equipments->count();
                $score = 0;
                $score += $this->rules->categoryScoreForStyle($styleSlug, $categorySlug);
                $score += $this->rules->styleTagScore($styleSlug, $styleSlugs);
                $score += $this->rules->difficultyFitScore($experienceLevel, $exercise->difficulty_level);

                if ($requiredEquipmentCount === 1) {
                    $score += 1;
                }

                return [
                    'exercise' => $exercise,
                    'category_slug' => $categorySlug,
                    'style_slugs' => $styleSlugs,
                    'style_phase' => $this->stylePhase($styleSlug, $styleSlugs),
                    'score' => $score,
                ];
            })
            ->sort(function (array $left, array $right): int {
                return $this->rules->compareScoreAndId(
                    $left['score'],
                    (int) $left['exercise']->id,
                    $right['score'],
                    (int) $right['exercise']->id
                );
            })
            ->values();
    }

    /**
     * @param  Collection<int, array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int
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
                    $styleSlug,
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
     *     score: int
     * }>  $scoredExercises
     * @param  array<string, int>  $dayCategoryUsage
     * @param  array<int, int>  $weeklyUsage
     * @return array{
     *     exercise: Exercise,
     *     category_slug: string|null,
     *     style_slugs: list<string>,
     *     style_phase: int,
     *     score: int
     * }|null
     */
    private function pickExerciseForSlot(
        Collection $scoredExercises,
        string $styleSlug,
        array $dayCategoryUsage,
        array $weeklyUsage
    ): ?array {
        if ($scoredExercises->isEmpty()) {
            return null;
        }

        $passes = [
            ['phases' => [1], 'max_repeat' => 2, 'enforce_category' => true],
            ['phases' => [1, 2], 'max_repeat' => 2, 'enforce_category' => true],
            ['phases' => [1, 2], 'max_repeat' => null, 'enforce_category' => true],
            ['phases' => [1, 2], 'max_repeat' => null, 'enforce_category' => false],
            ['phases' => [1, 2, 3], 'max_repeat' => 2, 'enforce_category' => true],
            ['phases' => [1, 2, 3], 'max_repeat' => null, 'enforce_category' => true],
            ['phases' => [1, 2, 3], 'max_repeat' => null, 'enforce_category' => false],
        ];

        foreach ($passes as $pass) {
            $candidate = $scoredExercises
                ->filter(function (array $item) use ($pass, $dayCategoryUsage, $weeklyUsage): bool {
                    if (! in_array($item['style_phase'], $pass['phases'], true)) {
                        return false;
                    }

                    $exerciseId = (int) $item['exercise']->id;
                    $currentWeeklyUsage = $weeklyUsage[$exerciseId] ?? 0;

                    if (is_int($pass['max_repeat']) && $currentWeeklyUsage >= $pass['max_repeat']) {
                        return false;
                    }

                    if ($pass['enforce_category'] && $item['category_slug'] !== null) {
                        $categoryUsage = $dayCategoryUsage[$item['category_slug']] ?? 0;

                        if ($categoryUsage >= 1) {
                            return false;
                        }
                    }

                    return true;
                })
                ->sort(function (array $left, array $right) use ($weeklyUsage): int {
                    $scoreComparison = $right['score'] <=> $left['score'];
                    if ($scoreComparison !== 0) {
                        return $scoreComparison;
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
         *     score: int
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
     *     score: int
     * }  $scoredExercise
     * @return array{sets: int, reps: string}
     */
    private function prescriptionForExercise(array $scoredExercise, string $styleSlug): array
    {
        $exercise = $scoredExercise['exercise'];
        $name = strtolower($exercise->name);

        if (str_contains($name, 'hold') || str_contains($name, 'isometric')) {
            return ['sets' => 3, 'reps' => '10-20 sec'];
        }

        if ($this->rules->isPrimaryCategory($styleSlug, $scoredExercise['category_slug'])) {
            return ['sets' => 4, 'reps' => '6-8'];
        }

        return ['sets' => 3, 'reps' => '10-15'];
    }

    /**
     * @param  list<string>  $exerciseStyleSlugs
     */
    private function stylePhase(string $userStyleSlug, array $exerciseStyleSlugs): int
    {
        if ($exerciseStyleSlugs === []) {
            return 1;
        }

        $normalized = array_map(static fn (string $slug): string => strtolower(trim($slug)), $exerciseStyleSlugs);
        $userStyleSlug = strtolower(trim($userStyleSlug));

        if (in_array($userStyleSlug, $normalized, true)) {
            return 1;
        }

        if (in_array('mixed', $normalized, true) || in_array('general', $normalized, true)) {
            return 2;
        }

        return 3;
    }
}
