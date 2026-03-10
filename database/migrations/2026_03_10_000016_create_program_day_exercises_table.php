<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_day_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_day_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('order_index');
            $table->unsignedTinyInteger('sets');
            $table->string('reps');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['program_day_id', 'order_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_day_exercises');
    }
};
