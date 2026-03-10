<?php

namespace App\Http\Controllers;

use App\Services\ProgramGeneratorService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProgramController extends Controller
{
    public function generate(Request $request, ProgramGeneratorService $programGeneratorService): RedirectResponse
    {
        try {
            $programGeneratorService->generateForUser((int) $request->user()->id);
        } catch (ValidationException $exception) {
            return back()->withErrors($exception->errors());
        }

        return back()->with('success', 'Program generated successfully.');
    }
}
