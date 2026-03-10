<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('style');
            $table->string('experience_level');
            $table->unsignedTinyInteger('training_days');
            $table->unsignedTinyInteger('duration_weeks')->default(4);
            $table->timestamps();

            $table->index('user_id');
            $table->index('style');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
