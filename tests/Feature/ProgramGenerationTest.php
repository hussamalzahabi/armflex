<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\Program;
use App\Models\Style;
use App\Models\User;
use Database\Seeders\CategorySeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Database\Seeders\StyleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_should_generate_and_store_program_with_days_and_exercises(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $response = $this
            ->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'));

        $response->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises')
            ->firstOrFail();

        $this->assertSame('mixed', $program->style);
        $this->assertSame('intermediate', $program->experience_level);
        $this->assertSame(4, $program->duration_weeks);
        $this->assertProgramStructure($program, expectedDays: 3, expectedExercisesPerDay: 3);
    }

    public function test_generation_should_reuse_existing_program_when_profile_and_template_match(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'))
            ->assertRedirect('/');

        $this->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'))
            ->assertRedirect('/');

        $this->assertSame(1, Program::query()->where('user_id', $user->id)->count());
    }

    public function test_generation_should_create_a_new_program_when_profile_changes(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $user->profile()->update([
            'experience_level' => 'advanced',
        ]);

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $this->assertSame(2, Program::query()->where('user_id', $user->id)->count());
    }

    public function test_two_day_profile_should_generate_two_days_with_four_exercises_each(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 2,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises')
            ->firstOrFail();

        $this->assertProgramStructure($program, expectedDays: 2, expectedExercisesPerDay: 4);
    }

    public function test_three_day_profile_should_generate_three_days_with_three_exercises_each(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises')
            ->firstOrFail();

        $this->assertProgramStructure($program, expectedDays: 3, expectedExercisesPerDay: 3);
    }

    public function test_six_or_seven_day_profile_should_cap_generation_at_five_days_only(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'intermediate',
            trainingDaysPerWeek: 7,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises')
            ->firstOrFail();

        $this->assertProgramStructure($program, expectedDays: 5);
    }

    public function test_generation_should_filter_out_exercises_when_required_equipment_is_missing(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'beginner',
            trainingDaysPerWeek: 2,
            equipmentNames: ['Dumbbells']
        );
        $allowedEquipmentIds = $user->equipments()->pluck('equipments.id')->map(fn ($id) => (int) $id)->all();

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises.exercise.equipments')
            ->firstOrFail();

        foreach ($program->days as $day) {
            foreach ($day->exercises as $programExercise) {
                $requiredEquipment = $programExercise->exercise->equipments
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->all();

                foreach ($requiredEquipment as $equipmentId) {
                    $this->assertContains($equipmentId, $allowedEquipmentIds);
                }
            }
        }
    }

    public function test_generation_should_filter_out_exercises_above_user_difficulty(): void
    {
        $this->seedGenerationData();
        $user = $this->createUserWithProfile(
            styleSlug: 'mixed',
            experienceLevel: 'beginner',
            trainingDaysPerWeek: 3,
            equipmentNames: $this->allEquipmentNames()
        );

        $this->actingAs($user)->from('/')->post(route('programs.generate'))->assertRedirect('/');

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days.exercises.exercise')
            ->firstOrFail();

        foreach ($program->days as $day) {
            foreach ($day->exercises as $programExercise) {
                $this->assertContains(
                    $programExercise->exercise->difficulty_level,
                    ['beginner', 'general']
                );
            }
        }
    }

    public function test_generation_should_fail_when_required_profile_fields_are_missing(): void
    {
        $this->seedGenerationData();
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'));

        $response->assertRedirect('/');
        $response->assertSessionHasErrors(['profile']);

        $style = Style::query()->where('slug', 'mixed')->firstOrFail();
        $user->profile()->create([
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'style_id' => $style->id,
            'weight_kg' => 95,
            'training_days_per_week' => null,
            'notes' => 'Missing training frequency should fail generation.',
        ]);

        $secondResponse = $this
            ->actingAs($user)
            ->from('/')
            ->post(route('programs.generate'));

        $secondResponse->assertRedirect('/');
        $secondResponse->assertSessionHasErrors(['training_days_per_week']);
        $this->assertDatabaseCount('programs', 0);
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

    /**
     * @param  list<string>  $equipmentNames
     */
    private function createUserWithProfile(
        string $styleSlug,
        string $experienceLevel,
        int $trainingDaysPerWeek,
        array $equipmentNames
    ): User {
        $user = User::factory()->create();
        $style = Style::query()->where('slug', $styleSlug)->firstOrFail();
        $equipmentIds = Equipment::query()
            ->whereIn('name', $equipmentNames)
            ->pluck('id')
            ->all();

        $user->profile()->create([
            'dominant_arm' => 'right',
            'experience_level' => $experienceLevel,
            'style_id' => $style->id,
            'weight_kg' => 92.5,
            'training_days_per_week' => $trainingDaysPerWeek,
            'notes' => 'Generated in acceptance test.',
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

    private function assertProgramStructure(
        Program $program,
        int $expectedDays,
        ?int $expectedExercisesPerDay = null
    ): void {
        $this->assertSame($expectedDays, $program->training_days);
        $this->assertCount($expectedDays, $program->days);

        if ($expectedExercisesPerDay === null) {
            return;
        }

        foreach ($program->days as $day) {
            $this->assertCount($expectedExercisesPerDay, $day->exercises);
        }
    }
}
