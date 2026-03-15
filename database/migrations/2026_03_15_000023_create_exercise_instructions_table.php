<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_instructions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->text('setup_instructions')->nullable();
            $table->text('execution_steps')->nullable();
            $table->text('coaching_cues')->nullable();
            $table->text('common_mistakes')->nullable();
            $table->text('why_it_matters')->nullable();
            $table->text('safety_notes')->nullable();
            $table->timestamps();

            $table->unique('exercise_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_instructions');
    }
};
