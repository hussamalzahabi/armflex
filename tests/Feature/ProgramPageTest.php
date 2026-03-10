<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProgramPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_should_not_access_programs_page(): void
    {
        $response = $this->get('/programs');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_should_view_programs_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/programs');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Programs/Index')
                ->where('programs', [])
                ->where('profileSummary.exists', false)
        );
    }
}
