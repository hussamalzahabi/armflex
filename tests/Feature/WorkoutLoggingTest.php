<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\Program;
use App\Models\ProgramDay;
use App\Models\User;
use App\Models\Workout;
use App\Models\WorkoutSet;
use Database\Seeders\CategorySeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Database\Seeders\StyleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WorkoutLoggingTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_should_start_workout_and_prefill_exercises_and_sets(): void
    {
        [$user, $program, $programDay] = $this->createProgramDayTemplate();

        $response = $this->actingAs($user)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $workout = Workout::query()->with('exercises.sets')->firstOrFail();

        $response->assertRedirect("/workouts/{$workout->id}");
        $this->assertDatabaseHas('workouts', [
            'user_id' => $user->id,
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);
        $this->assertCount(2, $workout->exercises);
        $this->assertSame(7, $workout->exercises->sum(fn ($exercise) => $exercise->sets->count()));
    }

    public function test_start_workout_should_reuse_existing_in_progress_workout_for_the_same_program_day(): void
    {
        [$user, $program, $programDay] = $this->createProgramDayTemplate();

        $this->actingAs($user)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $this->actingAs($user)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $this->assertDatabaseCount('workouts', 1);
    }

    public function test_user_should_update_workout_set_results(): void
    {
        [$user, $program, $programDay] = $this->createProgramDayTemplate();

        $this->actingAs($user)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $set = WorkoutSet::query()->firstOrFail();

        $response = $this->actingAs($user)->patchJson("/workout-sets/{$set->id}", [
            'reps' => 10,
            'weight' => 34.5,
            'duration_seconds' => null,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('set.reps', 10)
            ->assertJsonPath('set.weight', 34.5);

        $this->assertDatabaseHas('workout_sets', [
            'id' => $set->id,
            'reps' => 10,
            'duration_seconds' => null,
        ]);
    }

    public function test_user_should_finish_workout_and_lock_completion_time(): void
    {
        [$user, $program, $programDay] = $this->createProgramDayTemplate();

        $this->actingAs($user)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $workout = Workout::query()->firstOrFail();

        $response = $this->actingAs($user)->post("/workouts/{$workout->id}/finish");

        $response->assertRedirect("/workouts/{$workout->id}");
        $this->assertNotNull($workout->fresh()->completed_at);
    }

    public function test_user_should_not_update_another_users_workout_set(): void
    {
        [$owner, $program, $programDay] = $this->createProgramDayTemplate();

        $this->actingAs($owner)->post('/workouts/start', [
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
        ]);

        $intruder = User::factory()->create();
        $set = WorkoutSet::query()->firstOrFail();

        $this->actingAs($intruder)
            ->patchJson("/workout-sets/{$set->id}", ['reps' => 11])
            ->assertNotFound();
    }

    /**
     * @return array{0: User, 1: Program, 2: ProgramDay}
     */
    private function createProgramDayTemplate(): array
    {
        $this->seed([
            EquipmentSeeder::class,
            CategorySeeder::class,
            StyleSeeder::class,
            ExerciseSeeder::class,
        ]);

        $user = User::factory()->create();
        $program = $user->programs()->create([
            'name' => 'Mixed Intermediate Program',
            'style' => 'mixed',
            'experience_level' => 'intermediate',
            'training_days' => 3,
            'duration_weeks' => 4,
            'profile_signature' => 'fixture-profile-signature',
            'program_signature' => 'fixture-program-signature',
        ]);

        $programDay = $program->days()->create(['day_number' => 1]);
        $programDay->exercises()->create([
            'exercise_id' => Exercise::query()->where('slug', 'band-rising-holds')->firstOrFail()->id,
            'order_index' => 1,
            'sets' => 3,
            'reps' => '10-20 sec',
            'notes' => null,
        ]);
        $programDay->exercises()->create([
            'exercise_id' => Exercise::query()->where('slug', 'band-pronation-pulses')->firstOrFail()->id,
            'order_index' => 2,
            'sets' => 4,
            'reps' => '6-8',
            'notes' => null,
        ]);

        return [$user, $program, $programDay];
    }
}
