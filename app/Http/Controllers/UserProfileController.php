<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    private const PROFILE_STYLE_OPTIONS = ['toproll', 'hook', 'press', 'mixed'];

    public function edit(Request $request): Response
    {
        $user = $request->user();
        $equipments = Equipment::query()->get(['id', 'name'])->keyBy('name');

        $equipmentCategories = [
            [
                'id' => 'general',
                'name' => 'General Gym Equipment',
                'items' => [
                    'Dumbbells',
                    'Barbell',
                    'Cable Machine',
                    'Resistance Bands',
                ],
            ],
            [
                'id' => 'armwrestling',
                'name' => 'Armwrestling Specific Tools',
                'items' => [
                    'Wrist Wrench',
                    'Rolling Handle',
                    'Multispinner',
                    'Eccentric Handle',
                    'Table Strap',
                ],
            ],
        ];

        return Inertia::render('Profile/Edit', [
            'profile' => $user->profile,
            'styleOptions' => collect(self::PROFILE_STYLE_OPTIONS)->map(
                fn (string $style) => [
                    'label' => ucfirst($style),
                    'value' => $style,
                ]
            )->all(),
            'equipmentCategories' => collect($equipmentCategories)->map(function (array $category) use ($equipments) {
                return [
                    'id' => $category['id'],
                    'name' => $category['name'],
                    'items' => collect($category['items'])
                        ->map(fn (string $equipmentName) => $equipments->get($equipmentName))
                        ->filter()
                        ->values(),
                ];
            })->all(),
            'selectedEquipmentIds' => $user->equipments()
                ->pluck('equipments.id')
                ->all(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'dominant_arm' => ['required', 'in:left,right'],
            'experience_level' => ['required', 'in:beginner,intermediate,advanced'],
            'style' => ['nullable', 'in:'.implode(',', self::PROFILE_STYLE_OPTIONS)],
            'weight_kg' => ['nullable', 'numeric', 'between:30,300'],
            'training_days_per_week' => ['nullable', 'integer', 'between:1,7'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'equipment_ids' => ['nullable', 'array'],
            'equipment_ids.*' => ['integer', 'distinct', 'exists:equipments,id'],
        ]);

        $equipmentIds = $validated['equipment_ids'] ?? [];
        unset($validated['equipment_ids']);

        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );
        $request->user()->equipments()->sync($equipmentIds);

        return redirect()->route('profile.edit');
    }
}
