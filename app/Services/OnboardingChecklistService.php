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
                'label' => 'Complete your training profile',
                'description' => 'Set your training level, style, and weekly schedule.',
                'completed' => $user->profile_count > 0,
                'action_url' => route('profile.edit'),
                'action_label' => 'Open profile',
                'completed_label' => 'Training profile completed',
            ],
            [
                'key' => 'equipment_added',
                'label' => 'Add your equipment',
                'description' => 'Tell us what tools you have so we can generate the right exercises.',
                'completed' => $user->equipments_count > 0,
                'action_url' => route('profile.edit'),
                'action_label' => 'Open equipment',
                'completed_label' => 'Equipment added',
            ],
            [
                'key' => 'program_generated',
                'label' => 'Generate first program',
                'description' => 'Create a personalized training template based on your profile.',
                'completed' => $user->programs_count > 0,
                'action_url' => route('programs.index'),
                'action_label' => 'Generate program',
                'completed_label' => 'First program generated',
            ],
            [
                'key' => 'workout_started',
                'label' => 'Start first workout',
                'description' => 'Begin your first training session from your generated program.',
                'completed' => $user->workouts_count > 0,
                'action_url' => route('programs.index'),
                'action_label' => 'Start workout',
                'completed_label' => 'First workout started',
            ],
            [
                'key' => 'workout_completed',
                'label' => 'Complete first workout',
                'description' => 'Finish a session to unlock progress tracking and history.',
                'completed' => $user->completed_workouts_count > 0,
                'action_url' => route('workouts.index'),
                'action_label' => 'Open workouts',
                'completed_label' => 'First workout completed',
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
