<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Workout;
use App\Services\ProgramGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile()->with('style:id,name,slug')->first();
        $activeWorkoutsByDay = Workout::query()
            ->where('user_id', $user->id)
            ->whereNull('completed_at')
            ->get(['id', 'program_day_id', 'started_at'])
            ->keyBy('program_day_id');
        $completedWorkoutsByDay = Workout::query()
            ->where('user_id', $user->id)
            ->whereNotNull('completed_at')
            ->latest('completed_at')
            ->get(['id', 'program_day_id', 'completed_at'])
            ->unique('program_day_id')
            ->keyBy('program_day_id');
        $programs = Program::query()
            ->where('user_id', $user->id)
            ->with([
                'days.exercises.exercise.category:id,name,slug',
                'days.exercises.exercise.equipments:id,name',
            ])
            ->latest()
            ->get();

        return Inertia::render('Programs/Index', [
            'programs' => $programs->map(function (Program $program) use ($activeWorkoutsByDay, $completedWorkoutsByDay) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'style' => $program->style,
                    'experience_level' => $program->experience_level,
                    'training_days' => $program->training_days,
                    'duration_weeks' => $program->duration_weeks,
                    'created_at' => optional($program->created_at)->toIso8601String(),
                    'days' => $program->days->map(function ($day) use ($activeWorkoutsByDay, $completedWorkoutsByDay) {
                        $activeWorkout = $activeWorkoutsByDay->get($day->id);
                        $latestCompletedWorkout = $completedWorkoutsByDay->get($day->id);

                        return [
                            'id' => $day->id,
                            'day_number' => $day->day_number,
                            'active_workout_id' => $activeWorkout?->id,
                            'active_workout_started_at' => optional($activeWorkout?->started_at)->toIso8601String(),
                            'latest_completed_workout_id' => $latestCompletedWorkout?->id,
                            'latest_completed_workout_at' => optional($latestCompletedWorkout?->completed_at)->toIso8601String(),
                            'exercises' => $day->exercises->map(function ($programDayExercise) {
                                $exercise = $programDayExercise->exercise;

                                return [
                                    'id' => $programDayExercise->id,
                                    'order_index' => $programDayExercise->order_index,
                                    'sets' => $programDayExercise->sets,
                                    'reps' => $programDayExercise->reps,
                                    'notes' => $programDayExercise->notes,
                                    'exercise' => [
                                        'id' => $exercise->id,
                                        'name' => $exercise->name,
                                        'slug' => $exercise->slug,
                                        'difficulty_level' => $exercise->difficulty_level,
                                        'category' => $exercise->category ? [
                                            'name' => $exercise->category->name,
                                            'slug' => $exercise->category->slug,
                                        ] : null,
                                        'equipments' => $exercise->equipments
                                            ->map(fn ($equipment) => ['id' => $equipment->id, 'name' => $equipment->name])
                                            ->values()
                                            ->all(),
                                    ],
                                ];
                            })->values()->all(),
                        ];
                    })->values()->all(),
                ];
            })->values()->all(),
            'profileSummary' => [
                'exists' => $profile !== null,
                'style' => $profile?->style?->name,
                'experience_level' => $profile?->experience_level,
                'training_days_per_week' => $profile?->training_days_per_week,
            ],
        ]);
    }

    public function generate(Request $request, ProgramGeneratorService $programGeneratorService): RedirectResponse
    {
        try {
            $programGeneratorService->generateForUser((int) $request->user()->id);
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        return back();
    }
}
