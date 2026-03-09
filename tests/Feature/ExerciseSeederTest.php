<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\Exercise;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_exercise_seeder_should_create_initial_exercises_with_equipment_mapping(): void
    {
        $this->seed([
            EquipmentSeeder::class,
            ExerciseSeeder::class,
        ]);

        $this->assertDatabaseCount('exercises', 14);

        $this->assertDatabaseHas('exercises', [
            'slug' => 'low-pulley-rising',
            'category' => 'rising',
            'difficulty_level' => 'beginner',
            'is_active' => true,
        ]);

        $exercise = Exercise::query()->where('slug', 'wrist-wrench-pronation-curl')->firstOrFail();
        $wristWrench = Equipment::query()->where('name', 'Wrist Wrench')->firstOrFail();
        $cableMachine = Equipment::query()->where('name', 'Cable Machine')->firstOrFail();

        $this->assertDatabaseHas('exercise_equipment', [
            'exercise_id' => $exercise->id,
            'equipment_id' => $wristWrench->id,
        ]);

        $this->assertDatabaseHas('exercise_equipment', [
            'exercise_id' => $exercise->id,
            'equipment_id' => $cableMachine->id,
        ]);

        $this->assertSame(
            0,
            Exercise::query()->doesntHave('equipments')->count()
        );
    }
}
