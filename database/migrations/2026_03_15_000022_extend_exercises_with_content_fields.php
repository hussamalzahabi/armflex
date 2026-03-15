<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->renameColumn('description', 'short_description');
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->text('purpose')->nullable()->after('short_description');
            $table->boolean('is_beginner_friendly')->default(false)->after('difficulty_level');
            $table->boolean('is_isometric')->default(false)->after('is_beginner_friendly');
            $table->string('primary_video_url')->nullable()->after('is_active');
            $table->string('thumbnail_url')->nullable()->after('primary_video_url');
        });

        DB::table('exercises')
            ->whereNull('purpose')
            ->update([
                'purpose' => DB::raw('short_description'),
            ]);
    }

    public function down(): void
    {
        Schema::table('exercises', function (Blueprint $table) {
            $table->dropColumn([
                'purpose',
                'is_beginner_friendly',
                'is_isometric',
                'primary_video_url',
                'thumbnail_url',
            ]);
        });

        Schema::table('exercises', function (Blueprint $table) {
            $table->renameColumn('short_description', 'description');
        });
    }
};
