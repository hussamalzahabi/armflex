<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Profile/Edit', [
            'profile' => $user->profile,
            'availableEquipments' => Equipment::query()
                ->orderBy('name')
                ->get(['id', 'name']),
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
