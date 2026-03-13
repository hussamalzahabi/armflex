<?php

namespace App\Http\Controllers;

use App\Models\WorkoutSet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkoutSetController extends Controller
{
    public function update(Request $request, WorkoutSet $workoutSet): JsonResponse
    {
        abort_unless($workoutSet->workoutExercise->workout->user_id === $request->user()->id, 404);
        abort_if($workoutSet->workoutExercise->workout->completed_at !== null, 422, 'Completed workouts cannot be edited.');

        $validated = $request->validate([
            'reps' => ['nullable', 'integer', 'min:0'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $workoutSet->fill($validated);
        $workoutSet->save();

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
