<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\Style;
use Database\Seeders\CategorySeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Database\Seeders\StyleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExerciseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_exercise_seeder_should_create_initial_exercises_with_equipment_mapping(): void
    {
        $this->seed([
            EquipmentSeeder::class,
            CategorySeeder::class,
            StyleSeeder::class,
            ExerciseSeeder::class,
        ]);

        $this->assertDatabaseCount('exercises', 14);

        $rising = Category::query()->where('slug', 'rising')->firstOrFail();
        $this->assertDatabaseHas('exercises', [
            'slug' => 'low-pulley-rising',
            'category_id' => $rising->id,
            'difficulty_level' => 'beginner',
            'is_beginner_friendly' => true,
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('exercises', [
            'slug' => 'band-rising-holds',
            'is_isometric' => true,
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

        $toproll = Style::query()->where('slug', 'toproll')->firstOrFail();

        $this->assertDatabaseHas('exercise_style', [
            'exercise_id' => $exercise->id,
            'style_id' => $toproll->id,
        ]);

        $this->assertSame(
            0,
            Exercise::query()->doesntHave('styles')->count()
        );

        $instructionExercise = Exercise::query()->where('slug', 'band-pronation-pulses')->firstOrFail();

        $this->assertNotNull($instructionExercise->short_description);
        $this->assertNotNull($instructionExercise->purpose);
        $this->assertDatabaseHas('exercise_instructions', [
            'exercise_id' => $instructionExercise->id,
        ]);
    }
}
