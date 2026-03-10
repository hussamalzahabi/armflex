<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('styles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('exercise_style', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exercise_id')->constrained()->cascadeOnDelete();
            $table->foreignId('style_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['exercise_id', 'style_id']);
        });

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->foreignId('style_id')->nullable()->after('experience_level')->constrained('styles')->nullOnDelete();
        });

        DB::table('styles')->insert([
            ['name' => 'Toproll', 'slug' => 'toproll', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Hook', 'slug' => 'hook', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Press', 'slug' => 'press', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mixed', 'slug' => 'mixed', 'created_at' => now(), 'updated_at' => now()],
        ]);

        if (Schema::hasColumn('user_profiles', 'style')) {
            $stylesBySlug = DB::table('styles')->pluck('id', 'slug');
            DB::table('user_profiles')
                ->select('id', 'style')
                ->whereNotNull('style')
                ->orderBy('id')
                ->chunkById(100, function ($profiles) use ($stylesBySlug) {
                    foreach ($profiles as $profile) {
                        $styleId = $stylesBySlug->get((string) $profile->style);
                        if ($styleId) {
                            DB::table('user_profiles')
                                ->where('id', $profile->id)
                                ->update(['style_id' => $styleId]);
                        }
                    }
                });
        }
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('style_id');
        });

        Schema::dropIfExists('exercise_style');
        Schema::dropIfExists('styles');
    }
};
