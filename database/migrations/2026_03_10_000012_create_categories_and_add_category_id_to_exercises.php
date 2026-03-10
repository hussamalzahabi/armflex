<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('description')->constrained('categories')->nullOnDelete();
        });

        DB::table('categories')->insert([
            ['name' => 'Rising', 'slug' => 'rising', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Pronation', 'slug' => 'pronation', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cupping', 'slug' => 'cupping', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Fingers', 'slug' => 'fingers', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Backpressure', 'slug' => 'backpressure', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Side Pressure', 'slug' => 'side_pressure', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'General', 'slug' => 'general', 'created_at' => now(), 'updated_at' => now()],
        ]);

        if (Schema::hasColumn('exercises', 'category')) {
            $categoriesBySlug = DB::table('categories')->pluck('id', 'slug');

            DB::table('exercises')
                ->select('id', 'category')
                ->whereNotNull('category')
                ->orderBy('id')
                ->chunkById(100, function ($exercises) use ($categoriesBySlug) {
                    foreach ($exercises as $exercise) {
                        $categoryId = $categoriesBySlug->get((string) $exercise->category);

                        if ($categoryId) {
                            DB::table('exercises')
                                ->where('id', $exercise->id)
                                ->update(['category_id' => $categoryId]);
                        }
                    }
                });
        }
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });

        Schema::dropIfExists('categories');
    }
};
