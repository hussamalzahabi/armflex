<?php

namespace Tests\Unit;

use App\Services\ProgramGenerationRules;
use PHPUnit\Framework\TestCase;

class ProgramGenerationRulesTest extends TestCase
{
    public function test_category_scoring_should_follow_style_priorities(): void
    {
        $rules = new ProgramGenerationRules;

        // Toproll should strongly prefer rising, then cupping, then general.
        $this->assertSame(3, $rules->categoryScoreForStyle('toproll', 'rising'));
        $this->assertSame(2, $rules->categoryScoreForStyle('toproll', 'cupping'));
        $this->assertSame(1, $rules->categoryScoreForStyle('toproll', 'general'));
        $this->assertSame(0, $rules->categoryScoreForStyle('toproll', 'unknown'));
    }

    public function test_difficulty_matrix_should_allow_expected_levels_per_experience_level(): void
    {
        $rules = new ProgramGenerationRules;

        $this->assertTrue($rules->isDifficultyAllowed('beginner', 'beginner'));
        $this->assertTrue($rules->isDifficultyAllowed('beginner', 'general'));
        $this->assertFalse($rules->isDifficultyAllowed('beginner', 'intermediate'));

        $this->assertTrue($rules->isDifficultyAllowed('intermediate', 'beginner'));
        $this->assertTrue($rules->isDifficultyAllowed('intermediate', 'intermediate'));
        $this->assertFalse($rules->isDifficultyAllowed('intermediate', 'advanced'));

        $this->assertTrue($rules->isDifficultyAllowed('advanced', 'elite'));
        $this->assertTrue($rules->isDifficultyAllowed('elite', 'advanced'));
    }

    public function test_frequency_rules_should_map_days_and_exercises_per_day(): void
    {
        $rules = new ProgramGenerationRules;

        // v0.1 caps long availability at five generated days and uses denser
        // two-day plans to keep total weekly work reasonable.
        $this->assertSame(2, $rules->generatedDaysCount(2));
        $this->assertSame(3, $rules->generatedDaysCount(3));
        $this->assertSame(5, $rules->generatedDaysCount(7));

        $this->assertSame(4, $rules->exercisesPerDayCount(2));
        $this->assertSame(3, $rules->exercisesPerDayCount(3));
        $this->assertSame(3, $rules->exercisesPerDayCount(5));
    }

    public function test_score_ordering_should_be_deterministic_with_id_tie_breaker(): void
    {
        $rules = new ProgramGenerationRules;
        $rows = [
            ['score' => 5, 'id' => 10],
            ['score' => 7, 'id' => 3],
            ['score' => 5, 'id' => 2],
        ];

        usort($rows, fn (array $left, array $right): int => $rules->compareScoreAndId(
            $left['score'],
            $left['id'],
            $right['score'],
            $right['id']
        ));

        // Higher scores should win, and exact ties should fall back to id.
        $this->assertSame([3, 2, 10], array_column($rows, 'id'));
    }
}
