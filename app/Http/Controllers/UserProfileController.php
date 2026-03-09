<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'profile' => $request->user()->profile,
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
        ]);

        $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return redirect()->route('profile.edit');
    }
}
