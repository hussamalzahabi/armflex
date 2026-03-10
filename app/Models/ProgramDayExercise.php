<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgramDayExercise extends Model
{
    protected $fillable = [
        'program_day_id',
        'exercise_id',
        'order_index',
        'sets',
        'reps',
        'notes',
    ];

    public function programDay(): BelongsTo
    {
        return $this->belongsTo(ProgramDay::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
