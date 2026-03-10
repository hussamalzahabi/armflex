<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('exercises', 'category')) {
            // Compatibility across SQLite/MySQL when index may already be missing.
            DB::statement('DROP INDEX IF EXISTS exercises_category_index');

            Schema::table('exercises', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('exercises', 'category')) {
            Schema::table('exercises', function (Blueprint $table) {
                $table->string('category')->nullable()->after('description');
                $table->index('category');
            });
        }
    }
};
