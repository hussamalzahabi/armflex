<?php

namespace App\Services;

use App\Models\User;

class OnboardingChecklistService
{
    public function getChecklistForUser(int $userId): array
    {
        $user = $this->getUserWithChecklistCounts($userId);

        $items = [
            [
                'key' => 'training_profile_completed',
                'label' => 'Complete training profile',
                'completed' => $user->profile_count > 0,
                'action_url' => route('profile.edit'),
            ],
            [
                'key' => 'equipment_added',
                'label' => 'Add available equipment',
                'completed' => $user->equipments_count > 0,
                'action_url' => route('profile.edit'),
            ],
            [
                'key' => 'program_generated',
                'label' => 'Generate first program',
                'completed' => $user->programs_count > 0,
                'action_url' => route('programs.index'),
            ],
            [
                'key' => 'workout_started',
                'label' => 'Start first workout',
                'completed' => $user->workouts_count > 0,
                'action_url' => route('programs.index'),
            ],
            [
                'key' => 'workout_completed',
                'label' => 'Complete first workout',
                'completed' => $user->completed_workouts_count > 0,
                'action_url' => route('workouts.index'),
            ],
        ];

        $completedCount = collect($items)->where('completed', true)->count();

        return [
            'completed_count' => $completedCount,
            'total_count' => count($items),
            'all_completed' => $completedCount === count($items),
            'items' => $items,
        ];
    }

    public function getChecklistSummaryForUser(int $userId): array
    {
        $user = $this->getUserWithChecklistCounts($userId);

        $completedCount = collect([
            $user->profile_count > 0,
            $user->equipments_count > 0,
            $user->programs_count > 0,
            $user->workouts_count > 0,
            $user->completed_workouts_count > 0,
        ])->filter()->count();

        return [
            'completed_count' => $completedCount,
            'total_count' => 5,
            'all_completed' => $completedCount === 5,
        ];
    }

    private function getUserWithChecklistCounts(int $userId): User
    {
        return User::query()
            ->withCount([
                'profile',
                'equipments',
                'programs',
                'workouts',
                'workouts as completed_workouts_count' => fn ($query) => $query->whereNotNull('completed_at'),
            ])
            ->findOrFail($userId);
    }
}
