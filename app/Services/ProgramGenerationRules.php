<?php

namespace App\Services;

class ProgramGenerationRules
{
    /**
     * @var array<string, array{primary: list<string>, secondary: list<string>, optional: list<string>}>
     */
    private const STYLE_CATEGORY_PRIORITIES = [
        'toproll' => [
            'primary' => ['rising', 'pronation', 'backpressure', 'fingers'],
            'secondary' => ['cupping'],
            'optional' => ['side_pressure', 'general'],
        ],
        'hook' => [
            'primary' => ['cupping', 'side_pressure', 'backpressure'],
            'secondary' => ['fingers'],
            'optional' => ['pronation', 'general'],
        ],
        'press' => [
            'primary' => ['side_pressure', 'backpressure'],
            'secondary' => ['cupping'],
            'optional' => ['fingers', 'pronation', 'general'],
        ],
        'mixed' => [
            'primary' => ['rising', 'pronation', 'cupping', 'backpressure'],
            'secondary' => ['fingers', 'side_pressure'],
            'optional' => ['general'],
        ],
    ];

    /**
     * @var array<string, list<string>>
     */
    private const ALLOWED_DIFFICULTIES = [
        'beginner' => ['general', 'beginner'],
        'intermediate' => ['general', 'beginner', 'intermediate'],
        'advanced' => ['general', 'beginner', 'intermediate', 'advanced', 'elite'],
        'elite' => ['general', 'beginner', 'intermediate', 'advanced', 'elite'],
    ];

    /**
     * @var array<string, int>
     */
    private const DIFFICULTY_RANKS = [
        'general' => 0,
        'beginner' => 1,
        'intermediate' => 2,
        'advanced' => 3,
        'elite' => 4,
    ];

    /**
     * @return array{primary: list<string>, secondary: list<string>, optional: list<string>}
     */
    public function categoryPrioritiesForStyle(string $styleSlug): array
    {
        $styleSlug = $this->normalize($styleSlug);

        return self::STYLE_CATEGORY_PRIORITIES[$styleSlug] ?? self::STYLE_CATEGORY_PRIORITIES['mixed'];
    }

    public function categoryScoreForStyle(string $styleSlug, ?string $categorySlug): int
    {
        if ($categorySlug === null) {
            return 0;
        }

        $priorities = $this->categoryPrioritiesForStyle($styleSlug);
        $categorySlug = $this->normalize($categorySlug);

        if (in_array($categorySlug, $priorities['primary'], true)) {
            return 3;
        }

        if (in_array($categorySlug, $priorities['secondary'], true)) {
            return 2;
        }

        if (in_array($categorySlug, $priorities['optional'], true)) {
            return 1;
        }

        return 0;
    }

    public function isPrimaryCategory(string $styleSlug, ?string $categorySlug): bool
    {
        if ($categorySlug === null) {
            return false;
        }

        $priorities = $this->categoryPrioritiesForStyle($styleSlug);

        return in_array($this->normalize($categorySlug), $priorities['primary'], true);
    }

    /**
     * @return list<string>
     */
    public function allowedDifficultiesForLevel(string $experienceLevel): array
    {
        $experienceLevel = $this->normalize($experienceLevel);

        return self::ALLOWED_DIFFICULTIES[$experienceLevel] ?? self::ALLOWED_DIFFICULTIES['beginner'];
    }

    public function isDifficultyAllowed(string $experienceLevel, ?string $exerciseDifficulty): bool
    {
        if ($exerciseDifficulty === null) {
            return false;
        }

        return in_array(
            $this->normalize($exerciseDifficulty),
            $this->allowedDifficultiesForLevel($experienceLevel),
            true
        );
    }

    public function difficultyFitScore(string $experienceLevel, ?string $exerciseDifficulty): int
    {
        if ($exerciseDifficulty === null) {
            return 0;
        }

        $experienceLevel = $this->normalize($experienceLevel);
        $exerciseDifficulty = $this->normalize($exerciseDifficulty);

        if (! $this->isDifficultyAllowed($experienceLevel, $exerciseDifficulty)) {
            return 0;
        }

        if ($exerciseDifficulty === $experienceLevel) {
            return 2;
        }

        if ($exerciseDifficulty === 'general') {
            return 1;
        }

        $userRank = self::DIFFICULTY_RANKS[$experienceLevel] ?? self::DIFFICULTY_RANKS['beginner'];
        $exerciseRank = self::DIFFICULTY_RANKS[$exerciseDifficulty] ?? self::DIFFICULTY_RANKS['beginner'];

        return $exerciseRank < $userRank ? 1 : 0;
    }

    /**
     * @param  list<string>  $exerciseStyleSlugs
     */
    public function styleTagScore(string $userStyleSlug, array $exerciseStyleSlugs): int
    {
        if ($exerciseStyleSlugs === []) {
            return 0;
        }

        $userStyleSlug = $this->normalize($userStyleSlug);
        $normalized = array_values(array_unique(array_map([$this, 'normalize'], $exerciseStyleSlugs)));

        if (in_array($userStyleSlug, $normalized, true)) {
            return 2;
        }

        if (in_array('mixed', $normalized, true) || in_array('general', $normalized, true)) {
            return 1;
        }

        return 0;
    }

    public function generatedDaysCount(int $trainingDaysPerWeek): int
    {
        if ($trainingDaysPerWeek <= 2) {
            return 2;
        }

        if ($trainingDaysPerWeek >= 6) {
            return 5;
        }

        return $trainingDaysPerWeek;
    }

    public function exercisesPerDayCount(int $generatedDays): int
    {
        return $generatedDays === 2 ? 4 : 3;
    }

    public function styleLabel(string $styleSlug): string
    {
        return ucfirst($this->normalize($styleSlug));
    }

    public function levelLabel(string $experienceLevel): string
    {
        $experienceLevel = $this->normalize($experienceLevel);

        if ($experienceLevel === 'beginner') {
            return 'Foundation';
        }

        return ucfirst($experienceLevel);
    }

    public function buildProgramName(string $styleSlug, string $experienceLevel): string
    {
        return sprintf(
            '%s %s Program',
            $this->styleLabel($styleSlug),
            $this->levelLabel($experienceLevel)
        );
    }

    public function compareScoreAndId(
        int $leftScore,
        int $leftId,
        int $rightScore,
        int $rightId
    ): int {
        $scoreComparison = $rightScore <=> $leftScore;
        if ($scoreComparison !== 0) {
            return $scoreComparison;
        }

        return $leftId <=> $rightId;
    }

    private function normalize(string $value): string
    {
        return strtolower(trim($value));
    }
}
