<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\ExerciseInstruction;
use App\Models\Style;
use App\Models\User;
use Database\Seeders\EquipmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExercisePageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_should_not_access_exercise_detail_page(): void
    {
        $exercise = Exercise::query()->create([
            'name' => 'Fixture Exercise',
            'slug' => 'fixture-exercise',
            'short_description' => 'Fixture description',
            'purpose' => 'Fixture purpose',
            'difficulty_level' => 'beginner',
            'is_beginner_friendly' => true,
            'is_isometric' => false,
            'is_active' => true,
        ]);

        $this->get("/exercises/{$exercise->slug}")
            ->assertRedirect('/login');
    }

    public function test_authenticated_user_should_view_exercise_detail_page(): void
    {
        $this->seed(EquipmentSeeder::class);

        $user = User::factory()->create();
        $equipment = Equipment::query()->where('name', 'Dumbbells')->firstOrFail();
        $category = Category::query()->where('slug', 'pronation')->firstOrFail();
        $style = Style::query()->firstOrCreate([
            'slug' => 'toproll',
        ], [
            'name' => 'Toproll',
        ]);

        $exercise = Exercise::query()->create([
            'name' => 'Band Pronation Pulses',
            'slug' => 'band-pronation-pulses',
            'short_description' => 'A beginner-friendly pronation pulse drill.',
            'purpose' => 'Build hand turnover with simple band resistance.',
            'category_id' => $category->id,
            'difficulty_level' => 'beginner',
            'is_beginner_friendly' => true,
            'is_isometric' => false,
            'is_active' => true,
            'primary_video_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);

        $exercise->styles()->sync([$style->id]);
        $exercise->equipments()->sync([$equipment->id]);

        ExerciseInstruction::query()->create([
            'exercise_id' => $exercise->id,
            'setup_instructions' => "Anchor the band at hand level.\nKeep the elbow still.",
            'execution_steps' => "Rotate through the thumb.\nReturn under control.",
            'coaching_cues' => "Stay crisp.\nKeep tension in the fingers.",
            'common_mistakes' => 'Swinging the shoulder.',
            'why_it_matters' => 'Pronation helps you keep your hand.',
        ]);

        $this->actingAs($user)
            ->get("/exercises/{$exercise->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Exercises/Show')
                ->where('exercise.name', 'Band Pronation Pulses')
                ->where('exercise.short_description', 'A beginner-friendly pronation pulse drill.')
                ->where('exercise.purpose', 'Build hand turnover with simple band resistance.')
                ->where('exercise.category.slug', 'pronation')
                ->where('exercise.difficulty_level', 'beginner')
                ->where('exercise.is_beginner_friendly', true)
                ->where('exercise.styles.0.slug', 'toproll')
                ->where('exercise.equipments.0.name', 'Dumbbells')
                ->where('exercise.video_embed_url', 'https://www.youtube.com/embed/abc123')
                ->where('exercise.instruction.setup_instructions', "Anchor the band at hand level.\nKeep the elbow still."));
    }
}
