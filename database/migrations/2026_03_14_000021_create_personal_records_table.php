<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personal_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->string('record_type');
            $table->decimal('best_weight', 8, 2)->nullable();
            $table->unsignedSmallInteger('best_reps')->nullable();
            $table->unsignedInteger('best_duration_seconds')->nullable();
            $table->foreignId('workout_set_id')->nullable()->constrained('workout_sets')->nullOnDelete();
            $table->timestamp('achieved_at');
            $table->timestamps();

            $table->unique(['user_id', 'exercise_id', 'record_type']);
            $table->index(['user_id', 'achieved_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_records');
    }
};
