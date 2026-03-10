<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\Style;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $equipmentByName = Equipment::query()->pluck('id', 'name');
        $categoryBySlug = Category::query()->pluck('id', 'slug');
        $styleBySlug = Style::query()->pluck('id', 'slug');

        $exercises = [
            [
                'name' => 'Low Pulley Rising',
                'slug' => 'low-pulley-rising',
                'description' => 'Train knuckle height and rising strength using a low cable angle.',
                'category' => 'rising',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Cable Machine'],
                'styles' => ['toproll'],
            ],
            [
                'name' => 'Band Rising Holds',
                'slug' => 'band-rising-holds',
                'description' => 'Static rising holds with resistance bands to build hand height endurance.',
                'category' => 'rising',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Resistance Bands'],
                'styles' => ['toproll', 'mixed'],
            ],
            [
                'name' => 'Wrist Wrench Pronation Curl',
                'slug' => 'wrist-wrench-pronation-curl',
                'description' => 'Train pronation and hand containment using a wrist wrench.',
                'category' => 'pronation',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Wrist Wrench', 'Cable Machine'],
                'styles' => ['toproll'],
            ],
            [
                'name' => 'Band Pronation Pulses',
                'slug' => 'band-pronation-pulses',
                'description' => 'Short pronation pulses against band resistance for tendon conditioning.',
                'category' => 'pronation',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Resistance Bands'],
                'styles' => ['toproll', 'mixed'],
            ],
            [
                'name' => 'Rolling Handle Cup Curl',
                'slug' => 'rolling-handle-cup-curl',
                'description' => 'Dynamic cupping curl with rolling handle to train containment.',
                'category' => 'cupping',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Rolling Handle', 'Cable Machine'],
                'styles' => ['hook'],
            ],
            [
                'name' => 'Dumbbell Wrist Curls',
                'slug' => 'dumbbell-wrist-curls',
                'description' => 'Basic wrist flexion work for hand and forearm strength.',
                'category' => 'cupping',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Dumbbells'],
                'styles' => ['hook', 'press', 'mixed'],
            ],
            [
                'name' => 'Eccentric Fingertip Hold',
                'slug' => 'eccentric-fingertip-hold',
                'description' => 'Static fingertip containment hold using an eccentric handle.',
                'category' => 'fingers',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Eccentric Handle'],
                'styles' => ['hook'],
            ],
            [
                'name' => 'Band Finger Containment Hold',
                'slug' => 'band-finger-containment-hold',
                'description' => 'Isometric finger containment hold using light-to-moderate band load.',
                'category' => 'fingers',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Resistance Bands'],
                'styles' => ['hook', 'mixed'],
            ],
            [
                'name' => 'Seated Cable Back Pressure Row',
                'slug' => 'seated-cable-back-pressure-row',
                'description' => 'Back pressure rowing pattern emphasizing arm wrestling line.',
                'category' => 'backpressure',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Cable Machine'],
                'styles' => ['toproll', 'hook', 'press', 'mixed'],
            ],
            [
                'name' => 'Table Strap Back Pressure Drag',
                'slug' => 'table-strap-back-pressure-drag',
                'description' => 'Back pressure drag movement with table strap setup.',
                'category' => 'backpressure',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Table Strap', 'Cable Machine'],
                'styles' => ['hook', 'press'],
            ],
            [
                'name' => 'Cable Side Pressure Press',
                'slug' => 'cable-side-pressure-press',
                'description' => 'Controlled side pressure press for inside lane strength.',
                'category' => 'side_pressure',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Cable Machine'],
                'styles' => ['press', 'hook'],
            ],
            [
                'name' => 'Band Side Pressure Isometric',
                'slug' => 'band-side-pressure-isometric',
                'description' => 'Isometric side pressure hold against band resistance.',
                'category' => 'side_pressure',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Resistance Bands'],
                'styles' => ['press', 'mixed'],
            ],
            [
                'name' => 'Multispinner Rotation Pull',
                'slug' => 'multispinner-rotation-pull',
                'description' => 'Rotational pull for wrist and hand coordination with multispinner.',
                'category' => 'general',
                'difficulty_level' => 'intermediate',
                'is_active' => true,
                'equipment' => ['Multispinner', 'Cable Machine'],
                'styles' => ['mixed'],
            ],
            [
                'name' => 'Barbell Wrist Roller',
                'slug' => 'barbell-wrist-roller',
                'description' => 'General forearm endurance and wrist stability with a barbell setup.',
                'category' => 'general',
                'difficulty_level' => 'beginner',
                'is_active' => true,
                'equipment' => ['Barbell'],
                'styles' => ['mixed'],
            ],
        ];

        foreach ($exercises as $exerciseData) {
            $requiredEquipment = $exerciseData['equipment'];
            $categorySlug = $exerciseData['category'];
            $exerciseStyles = $exerciseData['styles'];
            unset($exerciseData['equipment']);
            unset($exerciseData['category']);
            unset($exerciseData['styles']);

            $exerciseData['category_id'] = $categoryBySlug->get($categorySlug);

            $exercise = Exercise::query()->updateOrCreate(
                ['slug' => $exerciseData['slug']],
                $exerciseData
            );

            $equipmentIds = collect($requiredEquipment)
                ->map(fn (string $equipmentName) => $equipmentByName->get($equipmentName))
                ->filter()
                ->values()
                ->all();

            $styleIds = collect($exerciseStyles)
                ->map(fn (string $styleSlug) => $styleBySlug->get($styleSlug))
                ->filter()
                ->values()
                ->all();

            $exercise->equipments()->sync($equipmentIds);
            $exercise->styles()->sync($styleIds);
        }
    }
}
