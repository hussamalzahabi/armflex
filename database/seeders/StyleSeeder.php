<?php

namespace Database\Seeders;

use App\Models\Style;
use Illuminate\Database\Seeder;

class StyleSeeder extends Seeder
{
    public function run(): void
    {
        $styles = [
            ['name' => 'Toproll', 'slug' => 'toproll'],
            ['name' => 'Hook', 'slug' => 'hook'],
            ['name' => 'Press', 'slug' => 'press'],
            ['name' => 'Mixed', 'slug' => 'mixed'],
        ];

        foreach ($styles as $style) {
            Style::query()->updateOrCreate(
                ['slug' => $style['slug']],
                $style
            );
        }
    }
}
