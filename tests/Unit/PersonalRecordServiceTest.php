<?php

namespace Tests\Unit;

use App\Models\Exercise;
use App\Models\PersonalRecord;
use App\Models\User;
use App\Models\Workout;
use App\Services\PersonalRecordService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PersonalRecordServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_weight_record_should_improve_when_weight_is_tied_and_reps_are_higher(): void
    {
        $service = app(PersonalRecordService::class);
        [$user, $workout, $workoutExercise] = $this->createWorkoutFixture('6-8');

        $workoutExercise->sets()->createMany([
            ['set_number' => 1, 'weight' => 20, 'reps' => 6],
            ['set_number' => 2, 'weight' => 20, 'reps' => 9],
        ]);

        PersonalRecord::query()->create([
            'user_id' => $user->id,
            'exercise_id' => $workoutExercise->exercise_id,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
            'best_weight' => 20,
            'best_reps' => 8,
            'workout_set_id' => null,
            'achieved_at' => now()->subDay(),
        ]);

        $newRecords = $service->evaluateWorkoutRecords($workout->fresh());

        $this->assertCount(1, $newRecords);
        $this->assertSame(20.0, $newRecords[0]['new_weight']);
        $this->assertSame(9, $newRecords[0]['new_reps']);
        $this->assertDatabaseHas('personal_records', [
            'user_id' => $user->id,
            'exercise_id' => $workoutExercise->exercise_id,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
            'best_reps' => 9,
        ]);
    }

    public function test_duration_record_should_improve_when_hold_time_is_longer(): void
    {
        $service = app(PersonalRecordService::class);
        [$user, $workout, $workoutExercise] = $this->createWorkoutFixture('10-20 sec');

        $workoutExercise->sets()->createMany([
            ['set_number' => 1, 'duration_seconds' => 12],
            ['set_number' => 2, 'duration_seconds' => 18],
        ]);

        PersonalRecord::query()->create([
            'user_id' => $user->id,
            'exercise_id' => $workoutExercise->exercise_id,
            'record_type' => PersonalRecord::TYPE_DURATION,
            'best_duration_seconds' => 15,
            'workout_set_id' => null,
            'achieved_at' => now()->subDay(),
        ]);

        $newRecords = $service->evaluateWorkoutRecords($workout->fresh());

        $this->assertCount(1, $newRecords);
        $this->assertSame(18, $newRecords[0]['new_duration_seconds']);
        $this->assertDatabaseHas('personal_records', [
            'user_id' => $user->id,
            'exercise_id' => $workoutExercise->exercise_id,
            'record_type' => PersonalRecord::TYPE_DURATION,
            'best_duration_seconds' => 18,
        ]);
    }

    /**
     * @return array{0: User, 1: Workout, 2: \App\Models\WorkoutExercise}
     */
    private function createWorkoutFixture(string $prescribedReps): array
    {
        $user = User::factory()->create();
        $exercise = Exercise::query()->create([
            'name' => 'Fixture Exercise',
            'slug' => 'fixture-exercise-'.str()->random(6),
            'description' => 'Fixture description',
            'difficulty_level' => 'beginner',
            'is_active' => true,
        ]);

        $program = $user->programs()->create([
            'name' => 'Fixture Program',
            'style' => 'mixed',
            'experience_level' => 'beginner',
            'training_days' => 3,
            'duration_weeks' => 4,
            'profile_signature' => 'fixture-profile-signature',
            'program_signature' => 'fixture-program-signature',
        ]);

        $programDay = $program->days()->create(['day_number' => 1]);
        $programDay->exercises()->create([
            'exercise_id' => $exercise->id,
            'order_index' => 1,
            'sets' => 2,
            'reps' => $prescribedReps,
        ]);

        $workout = Workout::query()->create([
            'user_id' => $user->id,
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
            'started_at' => now()->subHour(),
            'completed_at' => now(),
        ]);

        $workoutExercise = $workout->exercises()->create([
            'exercise_id' => $exercise->id,
            'order_index' => 1,
        ]);

        return [$user, $workout, $workoutExercise];
    }
}
