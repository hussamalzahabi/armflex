<?php

namespace App\Services;

use App\Models\Program;
use App\Models\User;
use App\Models\Workout;

class DashboardActionService
{
    public function getPrimaryStartWorkoutTargetForUser(User $user): array
    {
        $activeWorkout = Workout::query()
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->latest('started_at')
            ->first();

        if ($activeWorkout !== null) {
            return [
                'kind' => 'resume_workout',
                'label' => 'Start Workout',
                'url' => route('workouts.show', $activeWorkout),
            ];
        }

        $program = Program::query()
            ->where('user_id', $user->id)
            ->with('days:id,program_id,day_number')
            ->latest()
            ->first();

        if ($program !== null && $program->days->isNotEmpty()) {
            $completedDayIds = Workout::query()
                ->where('user_id', $user->id)
                ->where('program_id', $program->id)
                ->whereNotNull('completed_at')
                ->pluck('program_day_id')
                ->unique();

            $targetDay = $program->days->first(fn ($day) => ! $completedDayIds->contains($day->id))
                ?? $program->days->sortBy('day_number')->first();

            if ($targetDay !== null) {
                return [
                    'kind' => 'start_program_day',
                    'label' => 'Start Workout',
                    'program_id' => $program->id,
                    'program_day_id' => $targetDay->id,
                ];
            }
        }

        return [
            'kind' => 'open_programs',
            'label' => 'Start Workout',
            'url' => route('programs.index'),
        ];
    }
}
