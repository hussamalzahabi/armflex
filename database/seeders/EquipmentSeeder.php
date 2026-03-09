<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $equipmentNames = [
            'Dumbbells',
            'Barbell',
            'Cable Machine',
            'Resistance Bands',
            'Wrist Wrench',
            'Rolling Handle',
            'Multispinner',
            'Eccentric Handle',
            'Table Strap',
            'Minimal equipment (bands only)',
        ];

        foreach ($equipmentNames as $name) {
            Equipment::query()->firstOrCreate(['name' => $name]);
        }
    }
}
