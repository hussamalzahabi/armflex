<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalRecord extends Model
{
    public const TYPE_WEIGHT_REPS = 'weight_reps';

    public const TYPE_DURATION = 'duration';

    protected $fillable = [
        'user_id',
        'exercise_id',
        'record_type',
        'best_weight',
        'best_reps',
        'best_duration_seconds',
        'workout_set_id',
        'achieved_at',
    ];

    protected function casts(): array
    {
        return [
            'best_weight' => 'decimal:2',
            'achieved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }

    public function workoutSet(): BelongsTo
    {
        return $this->belongsTo(WorkoutSet::class);
    }
}
