<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_profile_page(): void
    {
        $response = $this->get('/profile');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_profile_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_or_update_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'weight_kg' => 92.5,
            'training_days_per_week' => 4,
            'notes' => 'Focus on pronation and back pressure.',
        ]);

        $response->assertRedirect('/profile');
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'training_days_per_week' => 4,
        ]);

        $updateResponse = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'left',
            'experience_level' => 'intermediate',
            'weight_kg' => 95,
            'training_days_per_week' => 5,
            'notes' => 'Increase table time volume.',
        ]);

        $updateResponse->assertRedirect('/profile');
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'dominant_arm' => 'left',
            'experience_level' => 'intermediate',
            'training_days_per_week' => 5,
        ]);
    }
}
