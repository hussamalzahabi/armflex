<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Exercise extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'category_id',
        'difficulty_level',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
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
}
