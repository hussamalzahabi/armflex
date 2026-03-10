<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('user_profiles', 'style')) {
            Schema::table('user_profiles', function (Blueprint $table) {
                // Added in an earlier migration; drop it explicitly before removing the column.
                $table->dropIndex('user_profiles_style_index');
            });

            Schema::table('user_profiles', function (Blueprint $table) {
                $table->dropColumn('style');
            });
        }

        Schema::dropIfExists('exercise_styles');
    }

    public function down(): void
    {
        if (! Schema::hasColumn('user_profiles', 'style')) {
            Schema::table('user_profiles', function (Blueprint $table) {
                $table->string('style')->nullable()->after('experience_level')->index();
            });
        }

        if (! Schema::hasTable('exercise_styles')) {
            Schema::create('exercise_styles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
                $table->string('style');
                $table->timestamps();

                $table->unique(['exercise_id', 'style']);
                $table->index('style');
            });
        }
    }
};
