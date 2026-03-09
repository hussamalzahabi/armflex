<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercise_styles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->string('style');
            $table->timestamps();

            $table->unique(['exercise_id', 'style']);
            $table->index('style');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercise_styles');
    }
};
