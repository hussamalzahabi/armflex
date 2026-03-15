<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->index(['category_id', 'is_active'], 'exercises_category_active_index');
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'programs_user_created_at_index');
        });

        Schema::table('workouts', function (Blueprint $table) {
            $table->index(['user_id', 'completed_at', 'started_at'], 'workouts_user_completed_started_index');
            $table->index(['user_id', 'program_id', 'program_day_id', 'completed_at', 'id'], 'workouts_user_program_day_completed_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('workouts', function (Blueprint $table) {
            $table->dropIndex('workouts_user_completed_started_index');
            $table->dropIndex('workouts_user_program_day_completed_id_index');
        });

        Schema::table('programs', function (Blueprint $table) {
            $table->dropIndex('programs_user_created_at_index');
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->dropIndex('exercises_category_active_index');
        });
    }
};
