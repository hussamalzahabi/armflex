<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\WorkoutController;
use App\Http\Controllers\WorkoutSetController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::get('/', DashboardController::class)->name('home');

    Route::get('/programs', [ProgramController::class, 'index'])->name('programs.index');
    Route::get('/exercises/{exercise:slug}', [ExerciseController::class, 'show'])->name('exercises.show');
    Route::get('/workouts', [WorkoutController::class, 'index'])->name('workouts.index');
    Route::get('/workouts/{workout}', [WorkoutController::class, 'show'])->name('workouts.show');
    Route::get('/profile', [UserProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [UserProfileController::class, 'update'])->name('profile.update');
    Route::post('/programs/generate', [ProgramController::class, 'generate'])->name('programs.generate');
    Route::post('/workouts/start', [WorkoutController::class, 'start'])->name('workouts.start');
    Route::post('/workouts/{workout}/finish', [WorkoutController::class, 'finish'])->name('workouts.finish');
    Route::post('/workouts/{workout}/reopen', [WorkoutController::class, 'reopen'])->name('workouts.reopen');
    Route::patch('/workout-sets/{workoutSet}', [WorkoutSetController::class, 'update'])->name('workout-sets.update');

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
