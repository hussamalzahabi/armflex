<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\Style;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $equipments = Equipment::query()->get(['id', 'name'])->keyBy('name');
        $styles = Style::query()->orderBy('id')->get(['id', 'name']);

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
            'styleOptions' => $styles->map(fn (Style $style) => [
                'label' => $style->name,
                'value' => $style->id,
            ])->all(),
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
            'style_id' => ['nullable', 'integer', 'exists:styles,id'],
            'weight_kg' => ['nullable', 'numeric', 'between:30,300'],
            'training_days_per_week' => ['nullable', 'integer', 'between:1,7'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'equipment_ids' => ['required', 'array', 'min:1'],
            'equipment_ids.*' => ['integer', 'distinct', 'exists:equipments,id'],
        ]);

        $equipmentIds = collect($validated['equipment_ids'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
        $selectedEquipmentNames = Equipment::query()
            ->whereIn('id', $equipmentIds)
            ->pluck('name')
            ->values()
            ->all();
        $specificTools = [
            'Wrist Wrench',
            'Rolling Handle',
            'Multispinner',
            'Eccentric Handle',
            'Table Strap',
        ];
        $anchorEquipments = [
            'Cable Machine',
            'Resistance Bands',
        ];

        $hasSpecificTool = count(array_intersect($selectedEquipmentNames, $specificTools)) > 0;
        $hasAnchorEquipment = count(array_intersect($selectedEquipmentNames, $anchorEquipments)) > 0;

        if ($hasSpecificTool && ! $hasAnchorEquipment) {
            return back()
                ->withInput()
                ->withErrors([
                    'equipment_ids' => 'Select Cable Machine or Resistance Bands when choosing armwrestling specific tools.',
                ]);
        }

        unset($validated['equipment_ids']);

        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );
        $request->user()->equipments()->sync($equipmentIds);

        return redirect()->route('profile.edit');
    }
}
