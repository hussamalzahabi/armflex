<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_number');
            $table->timestamps();

            $table->unique(['program_id', 'day_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('program_days');
    }
};
