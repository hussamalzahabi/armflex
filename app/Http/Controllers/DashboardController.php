<?php

namespace App\Http\Controllers;

use App\Services\OnboardingChecklistService;
use App\Services\TrainingStreakService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, OnboardingChecklistService $onboardingChecklistService, TrainingStreakService $trainingStreakService): Response
    {
        return Inertia::render('Home', [
            'title' => 'Dashboard',
            'onboardingChecklist' => $onboardingChecklistService->getChecklistForUser($request->user()->id),
            'trainingStreak' => $trainingStreakService->getSummaryForUser(
                $request->user()->id,
                $request->integer('streak_year') ?: null
            ),
        ]);
    }
}
