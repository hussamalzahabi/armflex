<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->restrictOnDelete();
            $table->unsignedSmallInteger('order_index');
            $table->timestamps();

            $table->unique(['workout_id', 'order_index']);
            $table->index('exercise_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_exercises');
    }
};
