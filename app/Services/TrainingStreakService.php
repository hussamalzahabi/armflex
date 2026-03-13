<?php

namespace App\Services;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class TrainingStreakService
{
    private const RECENT_ACTIVITY_DAYS_COUNT = 56;

    public function getSummaryForUser(int $userId, ?int $year = null): array
    {
        $today = CarbonImmutable::today();
        $selectedYear = $year ?: $today->year;
        $completedWorkoutCounts = $this->getCompletedWorkoutCountsByDateForUser($userId);
        $activeDateStrings = array_keys($completedWorkoutCounts);
        $currentStreak = $this->calculateCurrentStreak($activeDateStrings, $today);
        $yearOptions = $this->yearOptionsForActivityDates($activeDateStrings, $selectedYear);
        $clampedYear = in_array($selectedYear, $yearOptions, true) ? $selectedYear : $yearOptions[0];
        $activityCountsForYear = array_filter(
            $completedWorkoutCounts,
            fn (int $count, string $dateString) => CarbonImmutable::parse($dateString)->year === $clampedYear,
            ARRAY_FILTER_USE_BOTH
        );

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $this->calculateLongestStreak($activeDateStrings),
            'activity_days' => $this->buildActivityDaysForYear($activityCountsForYear, $clampedYear),
            'selected_year' => $clampedYear,
            'year_options' => $yearOptions,
            'message' => $this->messageForStreak($currentStreak),
        ];
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     * @return array<int, array{date: string, active: bool, workout_count: int}>
     */
    public function buildActivityDays(array $activeDateStrings, ?CarbonImmutable $today = null): array
    {
        $today ??= CarbonImmutable::today();
        $activeLookup = array_fill_keys($activeDateStrings, true);
        $startDate = $today->subDays(self::RECENT_ACTIVITY_DAYS_COUNT - 1);
        $days = [];

        for ($offset = 0; $offset < self::RECENT_ACTIVITY_DAYS_COUNT; $offset++) {
            $date = $startDate->addDays($offset)->toDateString();
            $days[] = [
                'date' => $date,
                'active' => isset($activeLookup[$date]),
                'workout_count' => isset($activeLookup[$date]) ? 1 : 0,
            ];
        }

        return $days;
    }

    /**
     * @param  array<string, int>  $completedWorkoutCounts
     * @return array<int, array{date: string, active: bool, workout_count: int}>
     */
    public function buildActivityDaysForYear(array $completedWorkoutCounts, int $year): array
    {
        $startDate = CarbonImmutable::create($year, 1, 1)->startOfDay();
        $endDate = $startDate->endOfYear();
        $days = [];
        $currentDate = $startDate;

        while ($currentDate->lte($endDate)) {
            $date = $currentDate->toDateString();
            $workoutCount = $completedWorkoutCounts[$date] ?? 0;
            $days[] = [
                'date' => $date,
                'active' => $workoutCount > 0,
                'workout_count' => $workoutCount,
            ];

            $currentDate = $currentDate->addDay();
        }

        return $days;
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     */
    public function calculateCurrentStreak(array $activeDateStrings, ?CarbonImmutable $today = null): int
    {
        $today ??= CarbonImmutable::today();
        $activeLookup = array_fill_keys($activeDateStrings, true);

        $anchorDate = null;
        if (isset($activeLookup[$today->toDateString()])) {
            $anchorDate = $today;
        } elseif (isset($activeLookup[$today->subDay()->toDateString()])) {
            $anchorDate = $today->subDay();
        }

        if (! $anchorDate) {
            return 0;
        }

        $streak = 0;
        $currentDate = $anchorDate;

        while (isset($activeLookup[$currentDate->toDateString()])) {
            $streak++;
            $currentDate = $currentDate->subDay();
        }

        return $streak;
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     */
    public function calculateLongestStreak(array $activeDateStrings): int
    {
        if ($activeDateStrings === []) {
            return 0;
        }

        sort($activeDateStrings);

        $current = 1;
        $longest = 1;

        for ($index = 1; $index < count($activeDateStrings); $index++) {
            $previousDate = CarbonImmutable::parse($activeDateStrings[$index - 1]);
            $currentDate = CarbonImmutable::parse($activeDateStrings[$index]);

            if ($previousDate->addDay()->isSameDay($currentDate)) {
                $current++;
                $longest = max($longest, $current);

                continue;
            }

            $current = 1;
        }

        return $longest;
    }

    public function messageForStreak(int $currentStreak): string
    {
        return match (true) {
            $currentStreak >= 7 => 'A full week of training consistency. Keep it going.',
            $currentStreak >= 3 => 'Nice momentum. Keep showing up.',
            $currentStreak >= 1 => 'Good start. Log your next workout to extend the streak.',
            default => 'Complete a workout to start your training streak.',
        };
    }

    /**
     * @return array<string, int>
     */
    private function getCompletedWorkoutCountsByDateForUser(int $userId): array
    {
        $user = User::query()->findOrFail($userId);

        return $user->workouts()
            ->whereNotNull('completed_at')
            ->get(['completed_at'])
            ->groupBy(fn ($workout) => $workout->completed_at->toDateString())
            ->map(fn (Collection $workouts) => $workouts->count())
            ->sortKeys()
            ->all();
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     * @return array<int, int>
     */
    private function yearOptionsForActivityDates(array $activeDateStrings, int $selectedYear): array
    {
        $years = collect($activeDateStrings)
            ->map(fn (string $dateString) => CarbonImmutable::parse($dateString)->year)
            ->push(CarbonImmutable::today()->year)
            ->push($selectedYear)
            ->unique()
            ->sortDesc()
            ->values()
            ->all();

        return $years;
    }
}
