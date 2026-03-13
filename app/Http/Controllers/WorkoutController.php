<?php

namespace App\Http\Controllers;

use App\Models\Workout;
use App\Services\WorkoutSessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WorkoutController extends Controller
{
    public function index(Request $request): Response
    {
        $workouts = Workout::query()
            ->where('user_id', $request->user()->id)
            ->with([
                'program:id,name,style,experience_level',
                'programDay:id,program_id,day_number',
                'exercises:id,workout_id,exercise_id,order_index',
                'exercises.sets:id,workout_exercise_id',
            ])
            ->latest('started_at')
            ->get();

        return Inertia::render('Workouts/Index', [
            'workouts' => $workouts->map(fn (Workout $workout) => [
                'id' => $workout->id,
                'program' => [
                    'id' => $workout->program->id,
                    'name' => $workout->program->name,
                    'style' => $workout->program->style,
                    'experience_level' => $workout->program->experience_level,
                ],
                'day_number' => $workout->programDay->day_number,
                'started_at' => optional($workout->started_at)->toIso8601String(),
                'completed_at' => optional($workout->completed_at)->toIso8601String(),
                'exercise_count' => $workout->exercises->count(),
                'set_count' => $workout->exercises->sum(fn ($exercise) => $exercise->sets->count()),
                'is_completed' => $workout->completed_at !== null,
            ])->values()->all(),
        ]);
    }

    public function show(Request $request, Workout $workout, WorkoutSessionService $workoutSessionService): Response
    {
        abort_unless($workout->user_id === $request->user()->id, 404);

        return Inertia::render('Workouts/Show', [
            'workout' => $this->toWorkoutPayload($workoutSessionService->loadWorkoutGraph($workout)),
        ]);
    }

    public function start(Request $request, WorkoutSessionService $workoutSessionService): RedirectResponse
    {
        $validated = $request->validate([
            'program_id' => ['required', 'integer'],
            'program_day_id' => ['required', 'integer'],
        ]);

        $workout = $workoutSessionService->startForUser(
            (int) $request->user()->id,
            (int) $validated['program_id'],
            (int) $validated['program_day_id']
        );

        return redirect()->route('workouts.show', $workout);
    }

    public function finish(Request $request, Workout $workout, WorkoutSessionService $workoutSessionService): RedirectResponse
    {
        try {
            $finishedWorkout = $workoutSessionService->finishForUser($workout, (int) $request->user()->id);
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        return redirect()->route('workouts.show', $finishedWorkout);
    }

    private function toWorkoutPayload(Workout $workout): array
    {
        $prescriptionsByOrder = $workout->programDay->exercises->keyBy('order_index');

        return [
            'id' => $workout->id,
            'program' => [
                'id' => $workout->program->id,
                'name' => $workout->program->name,
                'style' => $workout->program->style,
                'experience_level' => $workout->program->experience_level,
                'training_days' => $workout->program->training_days,
                'duration_weeks' => $workout->program->duration_weeks,
            ],
            'program_day' => [
                'id' => $workout->programDay->id,
                'day_number' => $workout->programDay->day_number,
            ],
            'started_at' => optional($workout->started_at)->toIso8601String(),
            'completed_at' => optional($workout->completed_at)->toIso8601String(),
            'notes' => $workout->notes,
            'exercises' => $workout->exercises->map(function ($workoutExercise) use ($prescriptionsByOrder) {
                $prescriptionSource = $prescriptionsByOrder->get($workoutExercise->order_index);
                $prescribedReps = (string) ($prescriptionSource?->reps ?? '');
                $isDurationBased = str_contains(strtolower($prescribedReps), 'sec');

                return [
                    'id' => $workoutExercise->id,
                    'order_index' => $workoutExercise->order_index,
                    'prescription' => [
                        'sets' => (int) ($prescriptionSource?->sets ?? $workoutExercise->sets->count()),
                        'reps' => $prescribedReps,
                        'is_duration_based' => $isDurationBased,
                    ],
                    'exercise' => [
                        'id' => $workoutExercise->exercise->id,
                        'name' => $workoutExercise->exercise->name,
                        'difficulty_level' => $workoutExercise->exercise->difficulty_level,
                        'category' => $workoutExercise->exercise->category ? [
                            'name' => $workoutExercise->exercise->category->name,
                            'slug' => $workoutExercise->exercise->category->slug,
                        ] : null,
                        'equipments' => $workoutExercise->exercise->equipments
                            ->map(fn ($equipment) => ['id' => $equipment->id, 'name' => $equipment->name])
                            ->values()
                            ->all(),
                    ],
                    'sets' => $workoutExercise->sets->map(fn ($set) => [
                        'id' => $set->id,
                        'set_number' => $set->set_number,
                        'reps' => $set->reps,
                        'weight' => $set->weight !== null ? (float) $set->weight : null,
                        'duration_seconds' => $set->duration_seconds,
                        'notes' => $set->notes,
                    ])->values()->all(),
                ];
            })->values()->all(),
        ];
    }
}
