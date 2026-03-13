<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\Program;
use App\Models\Style;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Database\Seeders\StyleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramGenerationEdgeCaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_toproll_generation_should_favor_primary_categories_over_optional_ones_when_available(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'toproll',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $program = $this->generateProgramForUser($user);
        $categorySlugs = collect($program->days)
            ->flatMap(fn ($day) => $day->exercises)
            ->map(fn ($row) => $row->exercise->category?->slug)
            ->filter()
            ->values()
            ->all();

        $primary = ['rising', 'pronation', 'backpressure', 'fingers'];
        $optional = ['side_pressure', 'general'];
        $primaryCount = count(array_filter($categorySlugs, fn (string $slug): bool => in_array($slug, $primary, true)));
        $optionalCount = count(array_filter($categorySlugs, fn (string $slug): bool => in_array($slug, $optional, true)));

        $this->assertGreaterThanOrEqual(7, $primaryCount);
        $this->assertLessThanOrEqual(2, $optionalCount);
    }

    public function test_generation_should_keep_category_unique_within_day_when_variety_exists(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $program = $this->generateProgramForUser($user);

        foreach ($program->days as $day) {
            $categorySlugs = collect($day->exercises)
                ->map(fn ($row) => $row->exercise->category?->slug)
                ->filter()
                ->values()
                ->all();

            $this->assertSame(
                count($categorySlugs),
                count(array_unique($categorySlugs)),
                "Day {$day->day_number} contains duplicate categories."
            );
        }
    }

    public function test_generation_should_limit_each_exercise_to_two_appearances_per_week_when_data_pool_is_sufficient(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 2,
            equipmentNames: $this->allEquipmentNames()
        );

        $program = $this->generateProgramForUser($user);
        $usage = collect($program->days)
            ->flatMap(fn ($day) => $day->exercises)
            ->groupBy('exercise_id')
            ->map(fn ($rows) => $rows->count());

        foreach ($usage as $exerciseId => $count) {
            $this->assertLessThanOrEqual(2, $count, "Exercise {$exerciseId} exceeded weekly repeat cap.");
        }
    }

    public function test_generation_should_use_fallback_rules_and_fill_days_when_exercise_pool_is_small(): void
    {
        $this->seedGenerationData();

        // This profile intentionally creates a tiny pool so the generator must
        // relax its normal variety rules and still build a complete week.
        $user = $this->createUserWithProfile(
            styleSlug: 'toproll',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: ['Dumbbells']
        );

        $program = $this->generateProgramForUser($user);
        $rows = collect($program->days)->flatMap(fn ($day) => $day->exercises)->values();

        $this->assertCount(3, $program->days);
        foreach ($program->days as $day) {
            $this->assertCount(3, $day->exercises);
        }

        $this->assertSame(1, $rows->pluck('exercise_id')->unique()->count());
        $this->assertSame(9, $rows->count());
    }

    public function test_generation_should_apply_hold_and_isometric_prescriptions(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'beginner',
            trainingDaysPerWeek: 2,
            equipmentNames: ['Resistance Bands']
        );

        $program = $this->generateProgramForUser($user);
        $rows = collect($program->days)->flatMap(fn ($day) => $day->exercises)->values();

        $holdRows = $rows->filter(function ($row): bool {
            $name = strtolower($row->exercise->name);

            return str_contains($name, 'hold') || str_contains($name, 'isometric');
        });

        $this->assertGreaterThan(0, $holdRows->count());

        foreach ($holdRows as $row) {
            $this->assertSame(3, $row->sets);
            $this->assertSame('10-20 sec', $row->reps);
        }
    }

    public function test_generation_should_apply_primary_and_support_prescriptions_from_style_priorities(): void
    {
        // Build the smallest possible fixture where one exercise is primary
        // for Toproll and one is only support-level, so the prescription split
        // reads like a direct business example.
        $toprollStyle = Style::query()->firstOrCreate(['slug' => 'toproll'], ['name' => 'Toproll']);
        $mixedStyle = Style::query()->firstOrCreate(['slug' => 'mixed'], ['name' => 'Mixed']);
        $risingCategory = Category::query()->firstOrCreate(['slug' => 'rising'], ['name' => 'Rising']);
        $cuppingCategory = Category::query()->firstOrCreate(['slug' => 'cupping'], ['name' => 'Cupping']);
        $cableMachine = Equipment::query()->firstOrCreate(['name' => 'Cable Machine']);

        $primaryExercise = Exercise::query()->create([
            'name' => 'Cable Rising Pull',
            'slug' => 'cable-rising-pull',
            'description' => 'Primary category test exercise.',
            'category_id' => $risingCategory->id,
            'difficulty_level' => 'intermediate',
            'is_active' => true,
        ]);
        $primaryExercise->equipments()->sync([$cableMachine->id]);
        $primaryExercise->styles()->sync([$toprollStyle->id]);

        $supportExercise = Exercise::query()->create([
            'name' => 'Cable Cup Curl',
            'slug' => 'cable-cup-curl',
            'description' => 'Support category test exercise.',
            'category_id' => $cuppingCategory->id,
            'difficulty_level' => 'intermediate',
            'is_active' => true,
        ]);
        $supportExercise->equipments()->sync([$cableMachine->id]);
        $supportExercise->styles()->sync([$mixedStyle->id]);

        $user = $this->createUserWithProfileAndEquipmentIds(
            styleId: $toprollStyle->id,
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 2,
            equipmentIds: [$cableMachine->id]
        );

        $program = $this->generateProgramForUser($user);
        $rows = collect($program->days)->flatMap(fn ($day) => $day->exercises)->values();

        $primaryRows = $rows->filter(fn ($row) => $row->exercise->category?->slug === 'rising');
        $supportRows = $rows->filter(fn ($row) => $row->exercise->category?->slug === 'cupping');

        $this->assertGreaterThan(0, $primaryRows->count());
        $this->assertGreaterThan(0, $supportRows->count());

        foreach ($primaryRows as $row) {
            $name = strtolower($row->exercise->name);
            if (str_contains($name, 'hold') || str_contains($name, 'isometric')) {
                continue;
            }

            $this->assertSame(4, $row->sets);
            $this->assertSame('6-8', $row->reps);
        }

        foreach ($supportRows as $row) {
            $this->assertSame(3, $row->sets);
            $this->assertSame('10-15', $row->reps);
        }
    }

    public function test_generation_should_store_profile_and_program_signatures(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $program = $this->generateProgramForUser($user);

        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', (string) $program->profile_signature);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', (string) $program->program_signature);
    }

    public function test_generation_should_create_different_signatures_for_different_users_when_scores_tie(): void
    {
        $mixedStyle = Style::query()->firstOrCreate(['slug' => 'mixed'], ['name' => 'Mixed']);
        $generalCategory = Category::query()->firstOrCreate(['slug' => 'general'], ['name' => 'General']);
        $dumbbells = Equipment::query()->firstOrCreate(['name' => 'Dumbbells']);

        for ($index = 1; $index <= 6; $index++) {
            $exercise = Exercise::query()->create([
                'name' => "Tie Exercise {$index}",
                'slug' => "tie-exercise-{$index}",
                'description' => 'Tie-break behavior test exercise.',
                'category_id' => $generalCategory->id,
                'difficulty_level' => 'beginner',
                'is_active' => true,
            ]);
            $exercise->equipments()->sync([$dumbbells->id]);
            $exercise->styles()->sync([$mixedStyle->id]);
        }

        $firstUser = $this->createUserWithProfileAndEquipmentIds(
            styleId: $mixedStyle->id,
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 2,
            equipmentIds: [$dumbbells->id]
        );
        $secondUser = $this->createUserWithProfileAndEquipmentIds(
            styleId: $mixedStyle->id,
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 2,
            equipmentIds: [$dumbbells->id]
        );

        $firstProgram = $this->generateProgramForUser($firstUser);
        $secondProgram = $this->generateProgramForUser($secondUser);

        $this->assertNotSame($firstProgram->program_signature, $secondProgram->program_signature);
    }

    private function seedGenerationData(): void
    {
        $this->seed([
            EquipmentSeeder::class,
            CategorySeeder::class,
            StyleSeeder::class,
            ExerciseSeeder::class,
        ]);
    }

    private function generateProgramForUser(User $user): Program
    {
        $this->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'))
            ->assertRedirect('/');

        return Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises.exercise.category')
            ->latest('id')
            ->firstOrFail();
    }

    /**
     * @param  list<string>  $equipmentNames
     */
    private function createUserWithProfile(
        string $styleSlug,
        string $experienceLevel,
        int $trainingDaysPerWeek,
        array $equipmentNames
    ): User {
        $style = Style::query()->where('slug', $styleSlug)->firstOrFail();
        $equipmentIds = Equipment::query()
            ->whereIn('name', $equipmentNames)
            ->pluck('id')
            ->all();

        return $this->createUserWithProfileAndEquipmentIds(
            styleId: $style->id,
            experienceLevel: $experienceLevel,
            trainingDaysPerWeek: $trainingDaysPerWeek,
            equipmentIds: $equipmentIds
        );
    }

    /**
     * @param  list<int>  $equipmentIds
     */
    private function createUserWithProfileAndEquipmentIds(
        int $styleId,
        string $experienceLevel,
        int $trainingDaysPerWeek,
        array $equipmentIds
    ): User {
        $user = User::factory()->create();

        $user->profile()->create([
            'dominant_arm' => 'right',
            'experience_level' => $experienceLevel,
            'style_id' => $styleId,
            'weight_kg' => 92.5,
            'training_days_per_week' => $trainingDaysPerWeek,
            'notes' => 'Generated in acceptance edge-case test.',
        ]);
        $user->equipments()->sync($equipmentIds);

        return $user;
    }

    /**
     * @return list<string>
     */
    private function allEquipmentNames(): array
    {
        return [
            'Dumbbells',
            'Barbell',
            'Cable Machine',
            'Resistance Bands',
            'Wrist Wrench',
            'Rolling Handle',
            'Multispinner',
            'Eccentric Handle',
            'Table Strap',
        ];
    }
}
