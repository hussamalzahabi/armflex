<?php

namespace App\Services;

use App\Models\Program;
use App\Models\ProgramDay;
use App\Models\Workout;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class WorkoutSessionService
{
    public function startForUser(int $userId, int $programId, int $programDayId): Workout
    {
        $program = Program::query()
            ->where('user_id', $userId)
            ->findOrFail($programId);

        $programDay = ProgramDay::query()
            ->where('program_id', $program->id)
            ->with(['exercises.exercise.category:id,name,slug', 'exercises.exercise.equipments:id,name'])
            ->findOrFail($programDayId);

        $existingWorkout = Workout::query()
            ->where('user_id', $userId)
            ->where('program_id', $program->id)
            ->where('program_day_id', $programDay->id)
            ->whereNull('completed_at')
            ->latest('id')
            ->first();

        if ($existingWorkout !== null) {
            return $this->loadWorkoutGraph($existingWorkout);
        }

        $startedAt = CarbonImmutable::now();

        $workout = DB::transaction(function () use ($userId, $program, $programDay, $startedAt): Workout {
            $workout = Workout::query()->create([
                'user_id' => $userId,
                'program_id' => $program->id,
                'program_day_id' => $programDay->id,
                'started_at' => $startedAt,
            ]);

            foreach ($programDay->exercises as $programDayExercise) {
                $workoutExercise = $workout->exercises()->create([
                    'exercise_id' => $programDayExercise->exercise_id,
                    'order_index' => $programDayExercise->order_index,
                ]);

                foreach (range(1, (int) $programDayExercise->sets) as $setNumber) {
                    $workoutExercise->sets()->create([
                        'set_number' => $setNumber,
                    ]);
                }
            }

            return $workout;
        });

        return $this->loadWorkoutGraph($workout);
    }

    public function finishForUser(Workout $workout, int $userId): Workout
    {
        abort_unless($workout->user_id === $userId, 404);

        if ($workout->completed_at === null) {
            $workout->forceFill([
                'completed_at' => CarbonImmutable::now(),
            ])->save();
        }

        return $this->loadWorkoutGraph($workout->fresh());
    }

    public function loadWorkoutGraph(Workout $workout): Workout
    {
        return $workout->load([
            'program:id,name,style,experience_level,training_days,duration_weeks',
            'programDay.exercises.exercise.category:id,name,slug',
            'programDay.exercises.exercise.equipments:id,name',
            'exercises.exercise.category:id,name,slug',
            'exercises.exercise.equipments:id,name',
            'exercises.sets',
        ]);
    }
}
