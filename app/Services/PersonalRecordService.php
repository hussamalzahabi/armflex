<?php

namespace App\Services;

use App\Models\PersonalRecord;
use App\Models\Workout;
use App\Models\WorkoutSet;
use Carbon\CarbonInterface;

class PersonalRecordService
{
    public function evaluateWorkoutRecords(Workout $workout): array
    {
        $workout->loadMissing([
            'programDay.exercises',
            'exercises.exercise:id,name',
            'exercises.sets',
        ]);

        $prescriptionsByOrder = $workout->programDay->exercises->keyBy('order_index');
        $newRecords = [];

        foreach ($workout->exercises as $workoutExercise) {
            $prescription = $prescriptionsByOrder->get($workoutExercise->order_index);
            $isDurationBased = str_contains(strtolower((string) ($prescription?->reps ?? '')), 'sec');

            if ($isDurationBased) {
                $record = $this->evaluateDurationRecord($workout, $workoutExercise->exercise->id, $workoutExercise->exercise->name, $workoutExercise->sets, $this->achievedAt($workout));

                if ($record !== null) {
                    $newRecords[] = $record;
                }

                continue;
            }

            $record = $this->evaluateWeightRecord($workout, $workoutExercise->exercise->id, $workoutExercise->exercise->name, $workoutExercise->sets, $this->achievedAt($workout));

            if ($record !== null) {
                $newRecords[] = $record;
            }
        }

        return $newRecords;
    }

    public function getDashboardSummaryForUser(int $userId): array
    {
        $records = PersonalRecord::query()
            ->where('user_id', $userId)
            ->with('exercise:id,name')
            ->latest('achieved_at')
            ->latest('id')
            ->get();

        return [
            'total_count' => $records->count(),
            'message' => $records->isEmpty()
                ? 'Complete workouts to start building your record board.'
                : 'Your latest best performances are ready to review.',
            'latest_records' => $records->take(3)->map(function (PersonalRecord $record) {
                return [
                    'id' => $record->id,
                    'exercise_name' => $record->exercise->name,
                    'record_type' => $record->record_type,
                    'value_label' => $this->formatRecordValue($record),
                    'achieved_at' => optional($record->achieved_at)->toIso8601String(),
                ];
            })->values()->all(),
        ];
    }

    private function evaluateDurationRecord(Workout $workout, int $exerciseId, string $exerciseName, $sets, CarbonInterface $achievedAt): ?array
    {
        $bestSet = $sets
            ->filter(fn (WorkoutSet $set) => $set->duration_seconds !== null)
            ->sortByDesc('duration_seconds')
            ->first();

        if (! $bestSet instanceof WorkoutSet) {
            return null;
        }

        $existingRecord = PersonalRecord::query()->firstOrNew([
            'user_id' => $workout->user_id,
            'exercise_id' => $exerciseId,
            'record_type' => PersonalRecord::TYPE_DURATION,
        ]);

        $previousDuration = $existingRecord->exists ? $existingRecord->best_duration_seconds : null;

        if ($previousDuration !== null && $bestSet->duration_seconds <= $previousDuration) {
            return null;
        }

        $existingRecord->fill([
            'best_weight' => null,
            'best_reps' => null,
            'best_duration_seconds' => $bestSet->duration_seconds,
            'workout_set_id' => $bestSet->id,
            'achieved_at' => $achievedAt,
        ])->save();

        return [
            'exercise_name' => $exerciseName,
            'record_type' => PersonalRecord::TYPE_DURATION,
            'new_duration_seconds' => $bestSet->duration_seconds,
            'previous_duration_seconds' => $previousDuration,
            'summary' => sprintf('%s — %s sec', $exerciseName, $bestSet->duration_seconds),
        ];
    }

    private function evaluateWeightRecord(Workout $workout, int $exerciseId, string $exerciseName, $sets, CarbonInterface $achievedAt): ?array
    {
        $bestSet = $sets
            ->filter(fn (WorkoutSet $set) => $set->weight !== null)
            ->sort(function (WorkoutSet $left, WorkoutSet $right) {
                $weightComparison = (float) $right->weight <=> (float) $left->weight;

                if ($weightComparison !== 0) {
                    return $weightComparison;
                }

                return ($right->reps ?? 0) <=> ($left->reps ?? 0);
            })
            ->first();

        if (! $bestSet instanceof WorkoutSet) {
            return null;
        }

        $existingRecord = PersonalRecord::query()->firstOrNew([
            'user_id' => $workout->user_id,
            'exercise_id' => $exerciseId,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
        ]);

        $previousWeight = $existingRecord->exists && $existingRecord->best_weight !== null ? (float) $existingRecord->best_weight : null;
        $previousReps = $existingRecord->exists ? $existingRecord->best_reps : null;
        $newWeight = (float) $bestSet->weight;
        $newReps = $bestSet->reps;

        if ($previousWeight !== null) {
            if ($newWeight < $previousWeight) {
                return null;
            }

            if ($newWeight === $previousWeight && ($newReps ?? 0) <= ($previousReps ?? 0)) {
                return null;
            }
        }

        $existingRecord->fill([
            'best_weight' => $newWeight,
            'best_reps' => $newReps,
            'best_duration_seconds' => null,
            'workout_set_id' => $bestSet->id,
            'achieved_at' => $achievedAt,
        ])->save();

        return [
            'exercise_name' => $exerciseName,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
            'new_weight' => $newWeight,
            'new_reps' => $newReps,
            'previous_weight' => $previousWeight,
            'previous_reps' => $previousReps,
            'summary' => sprintf('%s — %s x %s', $exerciseName, $this->formatWeight($newWeight), $newReps ?? '-'),
        ];
    }

    private function achievedAt(Workout $workout): CarbonInterface
    {
        return $workout->completed_at ?? now();
    }

    private function formatRecordValue(PersonalRecord $record): string
    {
        if ($record->record_type === PersonalRecord::TYPE_DURATION) {
            return sprintf('%s sec', $record->best_duration_seconds);
        }

        return sprintf('%s x %s', $this->formatWeight((float) $record->best_weight), $record->best_reps ?? '-');
    }

    private function formatWeight(float $weight): string
    {
        return rtrim(rtrim(number_format($weight, 2, '.', ''), '0'), '.');
    }
}
