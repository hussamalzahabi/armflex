<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\PersonalRecord;
use App\Models\User;
use App\Models\UserProfile;
use Carbon\CarbonImmutable;
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
        CarbonImmutable::setTestNow('2026-03-13 10:00:00');
        $user = User::factory()->create([
            'name' => '',
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('trainingStreak.current_streak', 0)
                ->where('trainingStreak.longest_streak', 0)
                ->has('trainingStreak.activity_days', 365)
                ->where('trainingStreak.selected_year', 2026)
                ->where('dashboardAnalytics.totals.workouts_completed', 0)
                ->where('dashboardAnalytics.totals.sets_logged', 0)
                ->where('dashboardAnalytics.totals.exercises_logged', 0)
                ->where('dashboardAnalytics.totals.personal_records', 0)
                ->where('dashboardAnalytics.this_week.workouts_completed', 0)
                ->where('dashboardAnalytics.this_week.sets_logged', 0)
                ->where('dashboardAnalytics.category_distribution', [])
                ->where('dashboardAnalytics.recent_workout', null)
                ->where('personalRecordsSummary.total_count', 0)
                ->where('personalRecordsSummary.latest_records', [])
                ->where('dashboardHero.title', 'Welcome back')
                ->where('dashboardHero.subtitle', 'Ready for today’s training?')
                ->where('dashboardHero.start_workout_target.kind', 'open_programs')
                ->where('dashboardHero.start_workout_target.url', route('programs.index'))
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
        CarbonImmutable::setTestNow('2026-03-13 10:00:00');
        $user = User::factory()->create([
            'name' => '',
        ]);

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
        $exercise = Exercise::query()->create([
            'name' => 'Dumbbell Wrist Curls',
            'slug' => 'dashboard-dumbbell-wrist-curls',
            'description' => 'Fixture exercise',
            'difficulty_level' => 'beginner',
            'is_active' => true,
        ]);

        $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
            'started_at' => now()->subDay(),
            'completed_at' => now(),
            'notes' => null,
        ]);

        $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $programDay->id,
            'started_at' => now()->subDays(2),
            'completed_at' => now()->subDay(),
            'notes' => null,
        ]);

        PersonalRecord::query()->create([
            'user_id' => $user->id,
            'exercise_id' => $exercise->id,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
            'best_weight' => 20,
            'best_reps' => 8,
            'workout_set_id' => null,
            'achieved_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('trainingStreak.current_streak', 2)
                ->where('trainingStreak.longest_streak', 2)
                ->has('trainingStreak.activity_days', 365)
                ->where('trainingStreak.selected_year', 2026)
                ->where('personalRecordsSummary.total_count', 1)
                ->where('personalRecordsSummary.latest_records.0.exercise_name', 'Dumbbell Wrist Curls')
                ->where('personalRecordsSummary.latest_records.0.value_label', '20 x 8')
                ->where('dashboardHero.title', 'Welcome back')
                ->where('dashboardHero.start_workout_target.kind', 'start_program_day')
                ->where('dashboardHero.start_workout_target.program_id', $program->id)
                ->where('dashboardHero.start_workout_target.program_day_id', $programDay->id)
                ->where('onboardingStatus.completed_count', 5)
                ->where('onboardingStatus.total_count', 5)
                ->where('onboardingStatus.all_completed', true)
                ->where('onboardingChecklist.completed_count', 5)
                ->where('onboardingChecklist.total_count', 5)
                ->where('onboardingChecklist.all_completed', true)
                ->where('onboardingChecklist.items.0.completed', true)
                ->where('onboardingChecklist.items.4.completed', true));
    }

    public function test_dashboard_should_target_next_program_day_when_no_workout_is_in_progress(): void
    {
        CarbonImmutable::setTestNow('2026-03-13 10:00:00');
        $user = User::factory()->create([
            'name' => 'Hussam Alzahabi',
        ]);

        $program = $user->programs()->create([
            'name' => 'Mixed Foundation Program',
            'style' => 'mixed',
            'experience_level' => 'beginner',
            'training_days' => 3,
            'duration_weeks' => 4,
            'profile_signature' => 'dashboard-profile-signature',
            'program_signature' => 'dashboard-program-signature',
        ]);

        $dayOne = $program->days()->create(['day_number' => 1]);
        $dayTwo = $program->days()->create(['day_number' => 2]);

        $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $dayOne->id,
            'started_at' => now()->subDay(),
            'completed_at' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('dashboardHero.title', 'Welcome back, Hussam')
                ->where('dashboardHero.start_workout_target.kind', 'start_program_day')
                ->where('dashboardHero.start_workout_target.program_id', $program->id)
                ->where('dashboardHero.start_workout_target.program_day_id', $dayTwo->id));
    }

    public function test_dashboard_should_show_training_analytics_from_completed_workouts(): void
    {
        CarbonImmutable::setTestNow('2026-03-13 10:00:00');

        $user = User::factory()->create();

        $program = $user->programs()->create([
            'name' => 'Toproll Program',
            'style' => 'toproll',
            'experience_level' => 'beginner',
            'training_days' => 2,
            'duration_weeks' => 4,
            'profile_signature' => 'analytics-profile-signature',
            'program_signature' => 'analytics-program-signature',
        ]);

        $dayOne = $program->days()->create(['day_number' => 1]);
        $dayTwo = $program->days()->create(['day_number' => 2]);

        $pronationCategory = Category::query()->firstOrCreate([
            'slug' => 'pronation',
        ], [
            'name' => 'Pronation',
        ]);

        $risingCategory = Category::query()->firstOrCreate([
            'slug' => 'rising',
        ], [
            'name' => 'Rising',
        ]);

        $pronationExercise = Exercise::query()->create([
            'name' => 'Band Pronation Pulses',
            'slug' => 'analytics-band-pronation-pulses',
            'short_description' => 'Fixture exercise',
            'difficulty_level' => 'beginner',
            'category_id' => $pronationCategory->id,
            'is_active' => true,
        ]);

        $risingExercise = Exercise::query()->create([
            'name' => 'Band Rising Holds',
            'slug' => 'analytics-band-rising-holds',
            'short_description' => 'Fixture exercise',
            'difficulty_level' => 'beginner',
            'category_id' => $risingCategory->id,
            'is_active' => true,
        ]);

        $olderWorkout = $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $dayOne->id,
            'started_at' => now()->subDays(12),
            'completed_at' => now()->subDays(12),
        ]);

        $olderPronatioExercise = $olderWorkout->exercises()->create([
            'exercise_id' => $pronationExercise->id,
            'order_index' => 1,
        ]);

        $olderPronatioExercise->sets()->create([
            'set_number' => 1,
            'reps' => 10,
            'weight' => 12.5,
        ]);

        $weekWorkout = $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $dayOne->id,
            'started_at' => now()->subDays(3),
            'completed_at' => now()->subDays(3),
        ]);

        $weekPronationExercise = $weekWorkout->exercises()->create([
            'exercise_id' => $pronationExercise->id,
            'order_index' => 1,
        ]);

        $weekPronationExercise->sets()->createMany([
            ['set_number' => 1, 'reps' => 8, 'weight' => 15],
            ['set_number' => 2, 'reps' => 7, 'weight' => 15],
        ]);

        $weekRisingExercise = $weekWorkout->exercises()->create([
            'exercise_id' => $risingExercise->id,
            'order_index' => 2,
        ]);

        $weekRisingExercise->sets()->create([
            'set_number' => 1,
            'duration_seconds' => 20,
        ]);

        $recentWorkout = $user->workouts()->create([
            'program_id' => $program->id,
            'program_day_id' => $dayTwo->id,
            'started_at' => now()->subDay(),
            'completed_at' => now()->subDay(),
        ]);

        $recentPronationExercise = $recentWorkout->exercises()->create([
            'exercise_id' => $pronationExercise->id,
            'order_index' => 1,
        ]);

        $recentPronationExercise->sets()->create([
            'set_number' => 1,
            'reps' => 6,
            'weight' => 17.5,
        ]);

        PersonalRecord::query()->create([
            'user_id' => $user->id,
            'exercise_id' => $pronationExercise->id,
            'record_type' => PersonalRecord::TYPE_WEIGHT_REPS,
            'best_weight' => 17.5,
            'best_reps' => 6,
            'workout_set_id' => null,
            'achieved_at' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->where('dashboardAnalytics.totals.workouts_completed', 3)
                ->where('dashboardAnalytics.totals.sets_logged', 5)
                ->where('dashboardAnalytics.totals.exercises_logged', 4)
                ->where('dashboardAnalytics.totals.personal_records', 1)
                ->where('dashboardAnalytics.this_week.workouts_completed', 2)
                ->where('dashboardAnalytics.this_week.sets_logged', 4)
                ->where('dashboardAnalytics.category_distribution.0.name', 'Pronation')
                ->where('dashboardAnalytics.category_distribution.0.count', 3)
                ->where('dashboardAnalytics.category_distribution.1.name', 'Rising')
                ->where('dashboardAnalytics.category_distribution.1.count', 1)
                ->where('dashboardAnalytics.recent_workout.title', 'Toproll Program')
                ->where('dashboardAnalytics.recent_workout.subtitle', 'Day 2 - Toproll Program'));
    }
}
