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
            if ($this->hasIndex('exercises', 'exercises_category_index')) {
                Schema::table('exercises', function (Blueprint $table) {
                    $table->dropIndex('exercises_category_index');
                });
            }

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

    private function hasIndex(string $table, string $index): bool
    {
        $driver = DB::getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            $database = DB::getDatabaseName();

            return DB::table('information_schema.statistics')
                ->where('table_schema', $database)
                ->where('table_name', $table)
                ->where('index_name', $index)
                ->exists();
        }

        if ($driver === 'sqlite') {
            $result = DB::select('PRAGMA index_list('.$table.')');

            foreach ($result as $row) {
                if (($row->name ?? null) === $index) {
                    return true;
                }
            }
        }

        return false;
    }
};
