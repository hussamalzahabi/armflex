<?php

namespace Tests\Unit;

use App\Services\TrainingStreakService;
use Carbon\CarbonImmutable;
use PHPUnit\Framework\TestCase;

class TrainingStreakServiceTest extends TestCase
{
    public function test_current_streak_should_count_back_from_today_or_yesterday(): void
    {
        $service = new TrainingStreakService;
        $today = CarbonImmutable::parse('2026-03-13');

        $this->assertSame(3, $service->calculateCurrentStreak([
            '2026-03-11',
            '2026-03-12',
            '2026-03-13',
        ], $today));

        $this->assertSame(2, $service->calculateCurrentStreak([
            '2026-03-11',
            '2026-03-12',
        ], $today));

        $this->assertSame(0, $service->calculateCurrentStreak([
            '2026-03-09',
            '2026-03-10',
        ], $today));
    }

    public function test_longest_streak_should_return_the_longest_consecutive_run(): void
    {
        $service = new TrainingStreakService;

        $this->assertSame(4, $service->calculateLongestStreak([
            '2026-02-20',
            '2026-02-21',
            '2026-02-22',
            '2026-02-23',
            '2026-03-01',
            '2026-03-02',
        ]));

        $this->assertSame(0, $service->calculateLongestStreak([]));
    }

    public function test_activity_grid_should_cover_the_last_fifty_six_days(): void
    {
        $service = new TrainingStreakService;
        $today = CarbonImmutable::parse('2026-03-13');

        $days = $service->buildActivityDays([
            '2026-03-13',
            '2026-03-12',
            '2026-02-01',
        ], $today);

        $this->assertCount(56, $days);
        $this->assertSame('2026-01-17', $days[0]['date']);
        $this->assertFalse($days[0]['active']);
        $this->assertSame('2026-03-13', $days[55]['date']);
        $this->assertTrue($days[55]['active']);
    }
}
