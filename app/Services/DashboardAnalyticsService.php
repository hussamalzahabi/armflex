<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsService
{
    public function getSummaryForUser(int $userId): array
    {
        $weekStart = CarbonImmutable::today()->startOfWeek(CarbonImmutable::MONDAY);
        $weekEnd = $weekStart->endOfWeek(CarbonImmutable::SUNDAY);

        return [
            'totals' => [
                'workouts_completed' => $this->completedWorkoutsCount($userId),
                'sets_logged' => $this->loggedSetsCount($userId),
                'exercises_logged' => $this->loggedExercisesCount($userId),
                'personal_records' => $this->personalRecordsCount($userId),
            ],
            'this_week' => [
                'workouts_completed' => $this->completedWorkoutsCount($userId, $weekStart, $weekEnd),
                'sets_logged' => $this->loggedSetsCount($userId, $weekStart, $weekEnd),
                'week_label' => sprintf(
                    '%s - %s',
                    $weekStart->format('M j'),
                    $weekEnd->format('M j')
                ),
            ],
            'category_distribution' => $this->categoryDistributionForUser($userId),
            'recent_workout' => $this->recentWorkoutForUser($userId),
        ];
    }

    private function completedWorkoutsCount(int $userId, ?CarbonImmutable $start = null, ?CarbonImmutable $end = null): int
    {
        $query = DB::table('workouts')
            ->where('user_id', $userId)
            ->whereNotNull('completed_at');

        if ($start && $end) {
            $query->whereBetween('completed_at', [$start, $end]);
        }

        return $query->count();
    }

    private function loggedSetsCount(int $userId, ?CarbonImmutable $start = null, ?CarbonImmutable $end = null): int
    {
        $query = DB::table('workout_sets')
            ->join('workout_exercises', 'workout_exercises.id', '=', 'workout_sets.workout_exercise_id')
            ->join('workouts', 'workouts.id', '=', 'workout_exercises.workout_id')
            ->where('workouts.user_id', $userId)
            ->whereNotNull('workouts.completed_at')
            ->where(function ($builder) {
                $builder
                    ->whereNotNull('workout_sets.reps')
                    ->orWhereNotNull('workout_sets.weight')
                    ->orWhereNotNull('workout_sets.duration_seconds');
            });

        if ($start && $end) {
            $query->whereBetween('workouts.completed_at', [$start, $end]);
        }

        return $query->count();
    }

    private function loggedExercisesCount(int $userId, ?CarbonImmutable $start = null, ?CarbonImmutable $end = null): int
    {
        $query = DB::table('workout_exercises')
            ->join('workouts', 'workouts.id', '=', 'workout_exercises.workout_id')
            ->join('workout_sets', 'workout_sets.workout_exercise_id', '=', 'workout_exercises.id')
            ->where('workouts.user_id', $userId)
            ->whereNotNull('workouts.completed_at')
            ->where(function ($builder) {
                $builder
                    ->whereNotNull('workout_sets.reps')
                    ->orWhereNotNull('workout_sets.weight')
                    ->orWhereNotNull('workout_sets.duration_seconds');
            });

        if ($start && $end) {
            $query->whereBetween('workouts.completed_at', [$start, $end]);
        }

        return $query->distinct()->count('workout_exercises.id');
    }

    private function personalRecordsCount(int $userId): int
    {
        return DB::table('personal_records')
            ->where('user_id', $userId)
            ->count();
    }

    /**
     * @return array<int, array{name: string, count: int, percentage: int}>
     */
    private function categoryDistributionForUser(int $userId): array
    {
        $rows = DB::table('workout_exercises')
            ->join('workouts', 'workouts.id', '=', 'workout_exercises.workout_id')
            ->join('exercises', 'exercises.id', '=', 'workout_exercises.exercise_id')
            ->join('categories', 'categories.id', '=', 'exercises.category_id')
            ->join('workout_sets', 'workout_sets.workout_exercise_id', '=', 'workout_exercises.id')
            ->where('workouts.user_id', $userId)
            ->whereNotNull('workouts.completed_at')
            ->where(function ($builder) {
                $builder
                    ->whereNotNull('workout_sets.reps')
                    ->orWhereNotNull('workout_sets.weight')
                    ->orWhereNotNull('workout_sets.duration_seconds');
            })
            ->select('categories.name')
            ->selectRaw('COUNT(DISTINCT workout_exercises.id) as exercise_count')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('exercise_count')
            ->orderBy('categories.name')
            ->get();

        $maxCount = (int) ($rows->max('exercise_count') ?? 0);

        return $rows->map(function ($row) use ($maxCount) {
            $count = (int) $row->exercise_count;

            return [
                'name' => $row->name,
                'count' => $count,
                'percentage' => $maxCount > 0 ? (int) round(($count / $maxCount) * 100) : 0,
            ];
        })->values()->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function recentWorkoutForUser(int $userId): ?array
    {
        $workout = DB::table('workouts')
            ->leftJoin('programs', 'programs.id', '=', 'workouts.program_id')
            ->leftJoin('program_days', 'program_days.id', '=', 'workouts.program_day_id')
            ->where('workouts.user_id', $userId)
            ->whereNotNull('workouts.completed_at')
            ->select([
                'workouts.id',
                'workouts.completed_at',
                'programs.name as program_name',
                'program_days.day_number',
            ])
            ->orderByDesc('workouts.completed_at')
            ->orderByDesc('workouts.id')
            ->first();

        if (! $workout) {
            return null;
        }

        return [
            'id' => $workout->id,
            'completed_at' => CarbonImmutable::parse($workout->completed_at)->toIso8601String(),
            'title' => $workout->program_name ?: 'Completed workout',
            'subtitle' => $workout->day_number
                ? sprintf('Day %d%s', $workout->day_number, $workout->program_name ? " - {$workout->program_name}" : '')
                : ($workout->program_name ?: 'Completed workout'),
        ];
    }
}
