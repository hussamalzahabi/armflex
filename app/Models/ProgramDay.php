<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramDay extends Model
{
    protected $fillable = [
        'program_id',
        'day_number',
    ];

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(ProgramDayExercise::class)->orderBy('order_index');
    }

    public function workouts(): HasMany
    {
        return $this->hasMany(Workout::class);
    }
}
