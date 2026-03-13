<?php

namespace Tests\Feature;

use App\Models\Exercise;
use App\Models\User;
use App\Services\WorkoutSessionService;
use Database\Seeders\CategorySeeder;
use Database\Seeders\EquipmentSeeder;
use Database\Seeders\ExerciseSeeder;
use Database\Seeders\StyleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkoutPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_should_not_access_workouts_page(): void
    {
        $this->get('/workouts')->assertRedirect('/login');
    }

    public function test_authenticated_user_should_view_workout_history_page(): void
    {
        [$user] = $this->createStartedWorkout();

        $this->actingAs($user)
            ->get('/workouts')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Workouts/Index')
                ->has('workouts', 1)
                ->where('workouts.0.day_number', 1));
    }

    public function test_authenticated_user_should_view_workout_session_page(): void
    {
        [$user, $workout] = $this->createStartedWorkout();

        $this->actingAs($user)
            ->get("/workouts/{$workout->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Workouts/Show')
                ->where('workout.id', $workout->id)
                ->where('workout.program_day.day_number', 1)
                ->has('workout.exercises', 2));
    }

    /**
     * @return array{0: User, 1: \App\Models\Workout}
     */
    private function createStartedWorkout(): array
    {
        $this->seed([
            EquipmentSeeder::class,
            CategorySeeder::class,
            StyleSeeder::class,
            ExerciseSeeder::class,
        ]);

        $user = User::factory()->create();
        $program = $user->programs()->create([
            'name' => 'Mixed Intermediate Program',
            'style' => 'mixed',
            'experience_level' => 'intermediate',
            'training_days' => 3,
            'duration_weeks' => 4,
            'profile_signature' => 'fixture-profile-signature',
            'program_signature' => 'fixture-program-signature',
        ]);

        $programDay = $program->days()->create(['day_number' => 1]);
        $programDay->exercises()->create([
            'exercise_id' => Exercise::query()->where('slug', 'band-rising-holds')->firstOrFail()->id,
            'order_index' => 1,
            'sets' => 3,
            'reps' => '10-20 sec',
            'notes' => null,
        ]);
        $programDay->exercises()->create([
            'exercise_id' => Exercise::query()->where('slug', 'band-pronation-pulses')->firstOrFail()->id,
            'order_index' => 2,
            'sets' => 4,
            'reps' => '6-8',
            'notes' => null,
        ]);

        $workout = app(WorkoutSessionService::class)->startForUser($user->id, $program->id, $programDay->id);

        return [$user, $workout];
    }
}
