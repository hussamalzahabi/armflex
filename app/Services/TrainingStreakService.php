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
        $activeDateStrings = $this->getActiveDatesForUser($userId)->all();
        $currentStreak = $this->calculateCurrentStreak($activeDateStrings, $today);
        $yearOptions = $this->yearOptionsForActivityDates($activeDateStrings, $selectedYear);
        $clampedYear = in_array($selectedYear, $yearOptions, true) ? $selectedYear : $yearOptions[0];
        $activityDatesForYear = array_values(array_filter(
            $activeDateStrings,
            fn (string $dateString) => CarbonImmutable::parse($dateString)->year === $clampedYear
        ));

        return [
            'current_streak' => $currentStreak,
            'longest_streak' => $this->calculateLongestStreak($activeDateStrings),
            'activity_days' => $this->buildActivityDaysForYear($activityDatesForYear, $clampedYear),
            'selected_year' => $clampedYear,
            'year_options' => $yearOptions,
            'message' => $this->messageForStreak($currentStreak),
        ];
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     * @return array<int, array{date: string, active: bool}>
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
            ];
        }

        return $days;
    }

    /**
     * @param  array<int, string>  $activeDateStrings
     * @return array<int, array{date: string, active: bool}>
     */
    public function buildActivityDaysForYear(array $activeDateStrings, int $year): array
    {
        $activeLookup = array_fill_keys($activeDateStrings, true);
        $startDate = CarbonImmutable::create($year, 1, 1)->startOfDay();
        $endDate = $startDate->endOfYear();
        $days = [];
        $currentDate = $startDate;

        while ($currentDate->lte($endDate)) {
            $date = $currentDate->toDateString();
            $days[] = [
                'date' => $date,
                'active' => isset($activeLookup[$date]),
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
     * @return Collection<int, string>
     */
    private function getActiveDatesForUser(int $userId): Collection
    {
        $user = User::query()->findOrFail($userId);

        return $user->workouts()
            ->whereNotNull('completed_at')
            ->orderBy('completed_at')
            ->get(['completed_at'])
            ->map(fn ($workout) => $workout->completed_at->toDateString())
            ->unique()
            ->values();
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
