<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_should_not_access_dashboard(): void
    {
        $this->get('/')->assertRedirect('/login');
    }

    public function test_authenticated_user_should_view_incomplete_onboarding_checklist(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('onboardingStatus.completed_count', 0)
                ->where('onboardingStatus.total_count', 5)
                ->where('onboardingStatus.all_completed', false)
                ->where('onboardingChecklist.completed_count', 0)
                ->where('onboardingChecklist.total_count', 5)
                ->where('onboardingChecklist.all_completed', false)
                ->where('onboardingChecklist.items.0.key', 'training_profile_completed')
                ->where('onboardingChecklist.items.0.completed', false)
                ->where('onboardingChecklist.items.4.key', 'workout_completed'));
    }

    public function test_authenticated_user_should_view_completed_onboarding_summary_when_activation_steps_exist(): void
    {
        $user = User::factory()->create();

        UserProfile::query()->create([
            'user_id' => $user->id,
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'training_days_per_week' => 3,
        ]);

        $equipment = Equipment::query()->create([
            'name' => 'Resistance Bands',
            'slug' => 'resistance-bands',
        ]);

        $user->equipments()->attach($equipment->id);

        $program = $user->programs()->create([
            'name' => 'Mixed Foundation Program',
            'style' => 'mixed',
            'experience_level' => 'beginner',
            'training_days' => 3,
            'duration_weeks' => 4,
            'profile_signature' => 'dashboard-profile-signature',
            'program_signature' => 'dashboard-program-signature',
        ]);

        $programDay = $program->days()->create(['day_number' => 1]);

        $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
            'started_at' => now()->subDay(),
            'completed_at' => now(),
            'notes' => null,
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('onboardingStatus.completed_count', 5)
                ->where('onboardingStatus.total_count', 5)
                ->where('onboardingStatus.all_completed', true)
                ->where('onboardingChecklist.completed_count', 5)
                ->where('onboardingChecklist.total_count', 5)
                ->where('onboardingChecklist.all_completed', true)
                ->where('onboardingChecklist.items.0.completed', true)
                ->where('onboardingChecklist.items.4.completed', true));
    }
}
