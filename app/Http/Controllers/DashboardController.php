<?php

namespace App\Http\Controllers;

use App\Services\DashboardActionService;
use App\Services\OnboardingChecklistService;
use App\Services\PersonalRecordService;
use App\Services\TrainingStreakService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(
        Request $request,
        OnboardingChecklistService $onboardingChecklistService,
        TrainingStreakService $trainingStreakService,
        DashboardActionService $dashboardActionService,
        PersonalRecordService $personalRecordService
    ): Response {
        $user = $request->user();

        return Inertia::render('Home', [
            'title' => 'Dashboard',
            'onboardingChecklist' => $onboardingChecklistService->getChecklistForUser($user->id),
            'trainingStreak' => $trainingStreakService->getSummaryForUser(
                $user->id,
                $request->integer('streak_year') ?: null
            ),
            'personalRecordsSummary' => $personalRecordService->getDashboardSummaryForUser($user->id),
            'dashboardHero' => [
                'title' => $this->welcomeTitle($user->name, $user->email),
                'subtitle' => 'Ready for today’s training?',
                'start_workout_target' => $dashboardActionService->getPrimaryStartWorkoutTargetForUser($user),
            ],
        ]);
    }

    private function welcomeTitle(?string $name, string $email): string
    {
        $firstName = trim((string) str($name)->before(' '));

        if ($firstName !== '') {
            return "Welcome back, {$firstName}";
        }

        if ($email !== '') {
            return 'Welcome back';
        }

        return 'Welcome back';
    }
}
