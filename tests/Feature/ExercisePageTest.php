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
                ->where('exercise.primary_style.slug', 'toproll')
                ->where('exercise.difficulty_level', 'beginner')
                ->where('exercise.is_beginner_friendly', true)
                ->where('exercise.styles.0.slug', 'toproll')
                ->where('exercise.equipments.0.name', 'Dumbbells')
                ->where('exercise.video_embed_url', 'https://www.youtube.com/embed/abc123')
                ->where('exercise.instruction.setup_instructions', "Anchor the band at hand level.\nKeep the elbow still."));
    }

    public function test_exercise_detail_page_should_include_related_exercises_prioritizing_same_category(): void
    {
        $this->seed(EquipmentSeeder::class);

        $user = User::factory()->create();
        $category = Category::query()->where('slug', 'pronation')->firstOrFail();
        $otherCategory = Category::query()->where('slug', 'cupping')->firstOrFail();
        $toproll = Style::query()->firstOrCreate(['slug' => 'toproll'], ['name' => 'Toproll']);
        $mixed = Style::query()->firstOrCreate(['slug' => 'mixed'], ['name' => 'Mixed']);

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
        ]);
        $exercise->styles()->sync([$toproll->id]);

        $sameCategorySharedStyle = Exercise::query()->create([
            'name' => 'Cable Pronation Pull',
            'slug' => 'cable-pronation-pull',
            'short_description' => 'A related pronation movement.',
            'purpose' => 'Train more pronation strength.',
            'category_id' => $category->id,
            'difficulty_level' => 'intermediate',
            'is_beginner_friendly' => false,
            'is_isometric' => false,
            'is_active' => true,
        ]);
        $sameCategorySharedStyle->styles()->sync([$toproll->id]);

        $sameCategoryOtherStyle = Exercise::query()->create([
            'name' => 'Strap Pronation Drag',
            'slug' => 'strap-pronation-drag',
            'short_description' => 'Another pronation option.',
            'purpose' => 'Train pronation through a drag line.',
            'category_id' => $category->id,
            'difficulty_level' => 'beginner',
            'is_beginner_friendly' => true,
            'is_isometric' => false,
            'is_active' => true,
        ]);
        $sameCategoryOtherStyle->styles()->sync([$mixed->id]);

        $differentCategorySharedStyle = Exercise::query()->create([
            'name' => 'Toproll Cup Curl',
            'slug' => 'toproll-cup-curl',
            'short_description' => 'Shared style but different category.',
            'purpose' => 'Blend cupping with toproll hand control.',
            'category_id' => $otherCategory->id,
            'difficulty_level' => 'beginner',
            'is_beginner_friendly' => true,
            'is_isometric' => false,
            'is_active' => true,
        ]);
        $differentCategorySharedStyle->styles()->sync([$toproll->id]);

        $response = $this->actingAs($user)
            ->get("/exercises/{$exercise->slug}");

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Exercises/Show')
                ->has('relatedExercises', 2)
                ->where('relatedExercises.0.slug', 'cable-pronation-pull')
                ->where('relatedExercises.1.slug', 'strap-pronation-drag'));
    }
}
