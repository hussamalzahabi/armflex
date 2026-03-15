<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseInstruction extends Model
{
    protected $fillable = [
        'exercise_id',
        'setup_instructions',
        'execution_steps',
        'coaching_cues',
        'common_mistakes',
        'why_it_matters',
        'safety_notes',
    ];

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
