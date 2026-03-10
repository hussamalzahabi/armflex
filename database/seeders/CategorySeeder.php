<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Rising', 'slug' => 'rising'],
            ['name' => 'Pronation', 'slug' => 'pronation'],
            ['name' => 'Cupping', 'slug' => 'cupping'],
            ['name' => 'Fingers', 'slug' => 'fingers'],
            ['name' => 'Backpressure', 'slug' => 'backpressure'],
            ['name' => 'Side Pressure', 'slug' => 'side_pressure'],
            ['name' => 'General', 'slug' => 'general'],
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
