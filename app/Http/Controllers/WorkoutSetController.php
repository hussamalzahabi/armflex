<?php

namespace App\Http\Controllers;

use App\Models\WorkoutSet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class WorkoutSetController extends Controller
{
    private const MAX_REPS = 65535;

    private const MAX_WEIGHT = 999999.99;

    private const MAX_DURATION_SECONDS = 4294967295;

    public function update(Request $request, WorkoutSet $workoutSet): JsonResponse
    {
        abort_unless($workoutSet->workoutExercise->workout->user_id === $request->user()->id, 404);
        abort_if($workoutSet->workoutExercise->workout->completed_at !== null, 422, 'Completed workouts cannot be edited.');

        $validated = $request->validate(
            [
                'reps' => ['nullable', 'integer', 'min:0', 'max:'.self::MAX_REPS],
                'weight' => ['nullable', 'numeric', 'min:0', 'max:'.self::MAX_WEIGHT],
                'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:'.self::MAX_DURATION_SECONDS],
                'notes' => ['nullable', 'string', 'max:1000'],
            ],
            [
                'reps.max' => 'Enter a smaller reps value.',
                'weight.max' => 'Enter a smaller weight value.',
                'duration_seconds.max' => 'Enter a smaller duration value.',
            ]
        );

        try {
            $workoutSet->fill($validated);
            $workoutSet->save();
        } catch (Throwable $exception) {
            Log::error('Workout set update failed.', [
                'workout_set_id' => $workoutSet->id,
                'user_id' => $request->user()->id,
                'payload' => $validated,
                'exception' => $exception,
            ]);

            return response()->json([
                'message' => 'Something went wrong while saving this set.',
            ], 500);
        }

        return response()->json([
            'set' => [
                'id' => $workoutSet->id,
                'reps' => $workoutSet->reps,
                'weight' => $workoutSet->weight !== null ? (float) $workoutSet->weight : null,
                'duration_seconds' => $workoutSet->duration_seconds,
                'notes' => $workoutSet->notes,
            ],
        ]);
    }
}
