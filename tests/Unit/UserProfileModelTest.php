<?php

namespace Tests\Unit;

use App\Models\UserProfile;
use PHPUnit\Framework\TestCase;

class UserProfileModelTest extends TestCase
{
    public function test_user_profile_model_has_expected_casts_and_fillable_fields(): void
    {
        $profile = new UserProfile;

        $this->assertSame('decimal:2', $profile->getCasts()['weight_kg'] ?? null);
        $this->assertContains('experience_level', $profile->getFillable());
        $this->assertContains('training_days_per_week', $profile->getFillable());
    }
}
