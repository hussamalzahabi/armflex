<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Exercise extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'short_description',
        'category_id',
        'purpose',
        'difficulty_level',
        'is_beginner_friendly',
        'is_isometric',
        'is_active',
        'primary_video_url',
        'thumbnail_url',
    ];

    protected function casts(): array
    {
        return [
            'is_beginner_friendly' => 'boolean',
            'is_isometric' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    protected function description(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->short_description,
            set: fn (?string $value) => ['short_description' => $value],
        );
    }

    public function equipments(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class, 'exercise_equipment');
    }

    public function styles(): BelongsToMany
    {
        return $this->belongsToMany(Style::class, 'exercise_style');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function programDayExercises(): HasMany
    {
        return $this->hasMany(ProgramDayExercise::class);
    }

    public function workoutExercises(): HasMany
    {
        return $this->hasMany(WorkoutExercise::class);
    }

    public function personalRecords(): HasMany
    {
        return $this->hasMany(PersonalRecord::class);
    }

    public function instruction(): HasOne
    {
        return $this->hasOne(ExerciseInstruction::class);
    }
}
