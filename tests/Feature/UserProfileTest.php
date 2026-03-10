<?php

namespace Tests\Feature;

use App\Models\Equipment;
use App\Models\Style;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_should_not_access_profile_page(): void
    {
        $response = $this->get('/profile');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_should_view_profile_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertOk();
    }

    public function test_authenticated_user_should_create_or_update_profile(): void
    {
        $user = User::factory()->create();
        $dumbbells = Equipment::query()->create(['name' => 'Dumbbells']);
        $bands = Equipment::query()->create(['name' => 'Resistance Bands']);
        $strap = Equipment::query()->create(['name' => 'Table Strap']);
        $toproll = Style::query()->firstOrCreate(['slug' => 'toproll'], ['name' => 'Toproll']);
        $press = Style::query()->firstOrCreate(['slug' => 'press'], ['name' => 'Press']);

        $response = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'style_id' => $toproll->id,
            'weight_kg' => 92.5,
            'training_days_per_week' => 4,
            'notes' => 'Focus on pronation and back pressure.',
            'equipment_ids' => [$dumbbells->id, $bands->id],
        ]);

        $response->assertRedirect('/profile');
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'style_id' => $toproll->id,
            'training_days_per_week' => 4,
        ]);
        $this->assertDatabaseHas('user_equipments', [
            'user_id' => $user->id,
            'equipment_id' => $dumbbells->id,
        ]);
        $this->assertDatabaseHas('user_equipments', [
            'user_id' => $user->id,
            'equipment_id' => $bands->id,
        ]);

        $updateResponse = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'left',
            'experience_level' => 'intermediate',
            'style_id' => $press->id,
            'weight_kg' => 95,
            'training_days_per_week' => 5,
            'notes' => 'Increase table time volume.',
            'equipment_ids' => [$strap->id, $bands->id],
        ]);

        $updateResponse->assertRedirect('/profile');
        $this->assertDatabaseHas('user_profiles', [
            'user_id' => $user->id,
            'dominant_arm' => 'left',
            'experience_level' => 'intermediate',
            'style_id' => $press->id,
            'training_days_per_week' => 5,
        ]);
        $this->assertDatabaseCount('user_profiles', 1);
        $this->assertDatabaseCount('user_equipments', 2);
        $this->assertDatabaseHas('user_equipments', [
            'user_id' => $user->id,
            'equipment_id' => $strap->id,
        ]);
        $this->assertDatabaseHas('user_equipments', [
            'user_id' => $user->id,
            'equipment_id' => $bands->id,
        ]);
    }

    public function test_guest_should_not_update_profile(): void
    {
        $response = $this->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
        ]);

        $response->assertRedirect('/login');
    }

    public function test_profile_update_should_require_valid_values(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'invalid',
            'experience_level' => 'expert',
            'style_id' => 999,
            'weight_kg' => 10,
            'training_days_per_week' => 9,
        ]);

        $response->assertSessionHasErrors([
            'dominant_arm',
            'experience_level',
            'style_id',
            'weight_kg',
            'training_days_per_week',
        ]);
    }

    public function test_profile_update_should_require_existing_equipment_ids(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'equipment_ids' => [9999],
        ]);

        $response->assertSessionHasErrors(['equipment_ids.0']);
    }

    public function test_profile_update_should_require_at_least_one_equipment(): void
    {
        $user = User::factory()->create();
        $toproll = Style::query()->firstOrCreate(['slug' => 'toproll'], ['name' => 'Toproll']);

        $response = $this->actingAs($user)->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'style_id' => $toproll->id,
            'weight_kg' => 85,
            'training_days_per_week' => 3,
            'equipment_ids' => [],
        ]);

        $response->assertSessionHasErrors(['equipment_ids']);
    }

    public function test_profile_update_should_require_anchor_equipment_when_specific_tools_are_selected(): void
    {
        $user = User::factory()->create();
        $toproll = Style::query()->firstOrCreate(['slug' => 'toproll'], ['name' => 'Toproll']);
        $wristWrench = Equipment::query()->create(['name' => 'Wrist Wrench']);

        $response = $this->actingAs($user)->from('/profile')->put('/profile', [
            'dominant_arm' => 'right',
            'experience_level' => 'beginner',
            'style_id' => $toproll->id,
            'weight_kg' => 85,
            'training_days_per_week' => 3,
            'equipment_ids' => [$wristWrench->id],
        ]);

        $response
            ->assertRedirect('/profile')
            ->assertSessionHasErrors(['equipment_ids']);
    }
}
