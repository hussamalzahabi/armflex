<?php

namespace App\Services;

class ProgramGenerationRules
{
    private const NO_SCORE = 0;

    private const CATEGORY_PRIORITY_SCORES = [
        'primary' => 3,
        'secondary' => 2,
        'optional' => 1,
    ];

    private const DIFFICULTY_FIT_SCORES = [
        'exact' => 2,
        'lower_or_general' => 1,
    ];

    private const STYLE_TAG_SCORES = [
        'exact' => 2,
        'flexible' => 1,
    ];

    private const SCHEDULE_RULES = [
        'minimum_days' => 2,
        'maximum_days' => 5,
        'cap_threshold' => 6,
        'two_day_plan' => 2,
        'two_day_exercises_per_day' => 4,
        'standard_exercises_per_day' => 3,
    ];

    private const PROGRAM_LEVEL_LABELS = [
        'beginner' => 'Foundation',
    ];

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
            return self::NO_SCORE;
        }

        $priorities = $this->categoryPrioritiesForStyle($styleSlug);
        $categorySlug = $this->normalize($categorySlug);

        if (in_array($categorySlug, $priorities['primary'], true)) {
            return self::CATEGORY_PRIORITY_SCORES['primary'];
        }

        if (in_array($categorySlug, $priorities['secondary'], true)) {
            return self::CATEGORY_PRIORITY_SCORES['secondary'];
        }

        if (in_array($categorySlug, $priorities['optional'], true)) {
            return self::CATEGORY_PRIORITY_SCORES['optional'];
        }

        return self::NO_SCORE;
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
            return self::NO_SCORE;
        }

        $experienceLevel = $this->normalize($experienceLevel);
        $exerciseDifficulty = $this->normalize($exerciseDifficulty);

        if (! $this->isDifficultyAllowed($experienceLevel, $exerciseDifficulty)) {
            return self::NO_SCORE;
        }

        if ($exerciseDifficulty === $experienceLevel) {
            return self::DIFFICULTY_FIT_SCORES['exact'];
        }

        if ($exerciseDifficulty === 'general') {
            return self::DIFFICULTY_FIT_SCORES['lower_or_general'];
        }

        $userRank = self::DIFFICULTY_RANKS[$experienceLevel] ?? self::DIFFICULTY_RANKS['beginner'];
        $exerciseRank = self::DIFFICULTY_RANKS[$exerciseDifficulty] ?? self::DIFFICULTY_RANKS['beginner'];

        return $exerciseRank < $userRank
            ? self::DIFFICULTY_FIT_SCORES['lower_or_general']
            : self::NO_SCORE;
    }

    /**
     * @param  list<string>  $exerciseStyleSlugs
     */
    public function styleTagScore(string $userStyleSlug, array $exerciseStyleSlugs): int
    {
        if ($exerciseStyleSlugs === []) {
            return self::NO_SCORE;
        }

        $userStyleSlug = $this->normalize($userStyleSlug);
        $normalized = array_values(array_unique(array_map([$this, 'normalize'], $exerciseStyleSlugs)));

        if (in_array($userStyleSlug, $normalized, true)) {
            return self::STYLE_TAG_SCORES['exact'];
        }

        if (in_array('mixed', $normalized, true) || in_array('general', $normalized, true)) {
            return self::STYLE_TAG_SCORES['flexible'];
        }

        return self::NO_SCORE;
    }

    public function generatedDaysCount(int $trainingDaysPerWeek): int
    {
        if ($trainingDaysPerWeek <= self::SCHEDULE_RULES['minimum_days']) {
            return self::SCHEDULE_RULES['minimum_days'];
        }

        if ($trainingDaysPerWeek >= self::SCHEDULE_RULES['cap_threshold']) {
            return self::SCHEDULE_RULES['maximum_days'];
        }

        return $trainingDaysPerWeek;
    }

    public function exercisesPerDayCount(int $generatedDays): int
    {
        return $generatedDays === self::SCHEDULE_RULES['two_day_plan']
            ? self::SCHEDULE_RULES['two_day_exercises_per_day']
            : self::SCHEDULE_RULES['standard_exercises_per_day'];
    }

    public function styleLabel(string $styleSlug): string
    {
        return ucfirst($this->normalize($styleSlug));
    }

    public function levelLabel(string $experienceLevel): string
    {
        $experienceLevel = $this->normalize($experienceLevel);

        if (isset(self::PROGRAM_LEVEL_LABELS[$experienceLevel])) {
            return self::PROGRAM_LEVEL_LABELS[$experienceLevel];
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
