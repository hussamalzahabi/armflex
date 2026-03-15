<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use App\Models\Exercise;
use App\Models\ExerciseInstruction;
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
                'short_description' => 'Train rising strength from a low cable angle to build hand height and knuckle control.',
                'purpose' => 'Use this movement to improve how well you lift through your hand and keep your knuckles high during outside pulling.',
                'category' => 'rising',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Cable Machine'],
                'styles' => ['toproll'],
                'instruction' => [
                    'setup_instructions' => "Set the cable low to the floor.\nUse a light handle or strap that lets you rise through your fingers.\nStand tall with your shoulder packed and wrist aligned.",
                    'execution_steps' => "Start with your hand slightly below shoulder height.\nLead the motion by lifting through your knuckles instead of curling the wrist.\nPause briefly at the top before returning under control.",
                    'coaching_cues' => "Think 'knuckles up'.\nKeep tension through the fingers.\nStay smooth instead of yanking the weight.",
                    'common_mistakes' => "Bending the wrist backward.\nShrugging the shoulder.\nUsing too much load and turning the rep into a body swing.",
                    'why_it_matters' => "Rising helps you climb through the opponent's hand and keep your frame strong in toproll-oriented positions.",
                    'safety_notes' => 'Use a manageable load and avoid sharp wrist extension if your hand or elbow feels irritated.',
                ],
            ],
            [
                'name' => 'Band Rising Holds',
                'slug' => 'band-rising-holds',
                'short_description' => 'Static band holds that build rising endurance and teach you how to keep your hand height under tension.',
                'purpose' => 'Use these holds to practice holding a strong rising position without losing finger tension.',
                'category' => 'rising',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => true,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Resistance Bands'],
                'styles' => ['toproll', 'mixed'],
                'instruction' => [
                    'setup_instructions' => "Anchor a light-to-moderate band below hand level.\nGrip the band so your fingers can stay active.\nStand far enough away to create steady tension.",
                    'execution_steps' => "Lift into your rising position.\nHold the top position without letting your knuckles collapse.\nBreathe and maintain steady tension for the full hold.",
                    'coaching_cues' => "Stay tall through the wrist.\nKeep the fingers switched on.\nLet the hold feel smooth and controlled.",
                    'common_mistakes' => "Letting the wrist dump.\nUsing a band that is too heavy.\nTurning the hold into a shaky shrug.",
                    'why_it_matters' => 'Band holds build positional strength for maintaining hand height when matches slow down or stall.',
                    'safety_notes' => 'Use shorter holds if your wrist or fingers are already fatigued.',
                ],
            ],
            [
                'name' => 'Wrist Wrench Pronation Curl',
                'slug' => 'wrist-wrench-pronation-curl',
                'short_description' => 'Pronating curl with a wrist wrench that challenges the hand, thumb, and forearm together.',
                'purpose' => 'Use this exercise to strengthen your ability to turn over the opponent’s hand while keeping containment.',
                'category' => 'pronation',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Wrist Wrench', 'Cable Machine'],
                'styles' => ['toproll'],
            ],
            [
                'name' => 'Band Pronation Pulses',
                'slug' => 'band-pronation-pulses',
                'short_description' => 'Short band pronation pulses that build forearm turnover and tendon conditioning.',
                'purpose' => 'Use these pulses to improve hand rotation without needing heavy load.',
                'category' => 'pronation',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Resistance Bands'],
                'styles' => ['toproll', 'mixed'],
                'instruction' => [
                    'setup_instructions' => "Anchor the band so it pulls slightly away from your hand.\nGrip in a way that lets you rotate through the thumb side.\nKeep your elbow and shoulder quiet.",
                    'execution_steps' => "Start in a neutral hand position.\nRotate into pronation in short controlled pulses.\nReturn only part of the way between reps to keep tension on the forearm.",
                    'coaching_cues' => "Turn through the thumb.\nKeep the elbow stable.\nThink quick, crisp motion instead of big movement.",
                    'common_mistakes' => "Rotating from the shoulder.\nLetting the wrist fold.\nUsing a band that forces sloppy pulses.",
                    'why_it_matters' => 'Pronation is one of the key tools for keeping your hand and opening the opponent’s fingers.',
                    'safety_notes' => 'If your inner elbow is sensitive, reduce the band tension and shorten the range.',
                ],
            ],
            [
                'name' => 'Rolling Handle Cup Curl',
                'slug' => 'rolling-handle-cup-curl',
                'short_description' => 'Dynamic cupping curl with a rolling handle that makes the fingers and wrist work together.',
                'purpose' => 'Use it to improve containment and wrist flexion against a moving handle.',
                'category' => 'cupping',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Rolling Handle', 'Cable Machine'],
                'styles' => ['hook'],
            ],
            [
                'name' => 'Dumbbell Wrist Curls',
                'slug' => 'dumbbell-wrist-curls',
                'short_description' => 'A basic wrist flexion exercise that builds forearm strength and hand control.',
                'purpose' => 'Use this as a simple starting point for cupping strength and forearm conditioning.',
                'category' => 'cupping',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Dumbbells'],
                'styles' => ['hook', 'press', 'mixed'],
                'instruction' => [
                    'setup_instructions' => "Sit with your forearm supported on your thigh or a bench.\nLet the hand move freely off the edge.\nChoose a light dumbbell you can control through the full motion.",
                    'execution_steps' => "Start with the wrist slightly extended.\nCurl the dumbbell by flexing the wrist.\nLower slowly back to the start without dropping the weight.",
                    'coaching_cues' => "Move through the wrist, not the shoulder.\nKeep the forearm still.\nControl the lowering phase.",
                    'common_mistakes' => "Using too much weight.\nBouncing through the bottom.\nLetting the elbow lift off the support.",
                    'why_it_matters' => 'Cupping strength helps you keep your wrist flexed and connected when pulling inside or controlling the hand.',
                    'safety_notes' => 'Stop short of painful wrist range and keep the weight modest if your forearm is already fatigued.',
                ],
            ],
            [
                'name' => 'Eccentric Fingertip Hold',
                'slug' => 'eccentric-fingertip-hold',
                'short_description' => 'A fingertip containment hold using an eccentric handle to stress the fingers and hand connection.',
                'purpose' => 'Use this to build stronger finger containment and better grip endurance under load.',
                'category' => 'fingers',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => true,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Eccentric Handle'],
                'styles' => ['hook'],
            ],
            [
                'name' => 'Band Finger Containment Hold',
                'slug' => 'band-finger-containment-hold',
                'short_description' => 'A simple band hold for teaching finger containment and staying connected through the hand.',
                'purpose' => 'Use this hold to train the fingers to stay tight without needing specialized equipment.',
                'category' => 'fingers',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => true,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Resistance Bands'],
                'styles' => ['hook', 'mixed'],
                'instruction' => [
                    'setup_instructions' => "Anchor the band so it pulls away from the fingertips.\nSet your hand in a comfortable containment shape.\nCreate tension before starting the hold.",
                    'execution_steps' => "Pull into your containment position.\nHold without letting the fingers open.\nKeep the wrist and hand stacked while you breathe through the effort.",
                    'coaching_cues' => "Keep the fingertips alive.\nStay connected through the thumb and fingers.\nUse smooth tension instead of squeezing wildly.",
                    'common_mistakes' => "Letting the fingers straighten.\nOver-gripping and losing hand shape.\nUsing band tension that forces compensation.",
                    'why_it_matters' => 'Finger containment helps you keep contact and stop your opponent from slipping through your hand.',
                    'safety_notes' => 'Reduce hold time if your fingertips or pulley tissues feel irritated.',
                ],
            ],
            [
                'name' => 'Seated Cable Back Pressure Row',
                'slug' => 'seated-cable-back-pressure-row',
                'short_description' => 'A seated cable row adapted to an arm wrestling line for back pressure and elbow flexion strength.',
                'purpose' => 'Use this movement to build pulling power along the same line you use to drag your opponent back.',
                'category' => 'backpressure',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Cable Machine'],
                'styles' => ['toproll', 'hook', 'press', 'mixed'],
                'instruction' => [
                    'setup_instructions' => "Sit tall with the cable in front of you.\nUse a handle or strap that lets you stay close to your arm wrestling line.\nBrace the shoulder before pulling.",
                    'execution_steps' => "Start with the arm extended but not loose.\nPull back by driving the elbow and hand together along your line.\nPause briefly and return under control.",
                    'coaching_cues' => "Drag through the elbow.\nKeep the shoulder packed.\nStay connected to the hand as you row.",
                    'common_mistakes' => "Leaning back too much.\nPulling with a loose wrist.\nTurning the movement into a general gym row.",
                    'why_it_matters' => 'Back pressure is a core driver for both outside and inside pulling because it keeps you connected and pulling behind your hand.',
                    'safety_notes' => 'Keep your shoulder stable and avoid jerking the first inch of the rep.',
                ],
            ],
            [
                'name' => 'Table Strap Back Pressure Drag',
                'slug' => 'table-strap-back-pressure-drag',
                'short_description' => 'Back pressure drag using a table strap setup for a more specific arm wrestling line.',
                'purpose' => 'Use it to make your cable back pressure work feel more table-specific.',
                'category' => 'backpressure',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Table Strap', 'Cable Machine'],
                'styles' => ['hook', 'press'],
            ],
            [
                'name' => 'Cable Side Pressure Press',
                'slug' => 'cable-side-pressure-press',
                'short_description' => 'Controlled cable press that trains side pressure and inside-lane connection.',
                'purpose' => 'Use this movement to build side pressure in a controlled way without slamming into end range.',
                'category' => 'side_pressure',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Cable Machine'],
                'styles' => ['press', 'hook'],
            ],
            [
                'name' => 'Band Side Pressure Isometric',
                'slug' => 'band-side-pressure-isometric',
                'short_description' => 'A band-based side pressure hold that teaches controlled inside-lane tension.',
                'purpose' => 'Use it as a beginner-friendly way to feel side pressure without heavy table stress.',
                'category' => 'side_pressure',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => true,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Resistance Bands'],
                'styles' => ['press', 'mixed'],
            ],
            [
                'name' => 'Multispinner Rotation Pull',
                'slug' => 'multispinner-rotation-pull',
                'short_description' => 'Rotational pull using a multispinner to challenge wrist coordination and hand control.',
                'purpose' => 'Use this exercise to blend pulling and rotation while teaching the hand to stay organized.',
                'category' => 'general',
                'difficulty_level' => 'intermediate',
                'is_beginner_friendly' => false,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Multispinner', 'Cable Machine'],
                'styles' => ['mixed'],
            ],
            [
                'name' => 'Barbell Wrist Roller',
                'slug' => 'barbell-wrist-roller',
                'short_description' => 'Forearm endurance and wrist stability work using a barbell wrist roller setup.',
                'purpose' => 'Use it for general forearm capacity and grip endurance when you want simple volume work.',
                'category' => 'general',
                'difficulty_level' => 'beginner',
                'is_beginner_friendly' => true,
                'is_isometric' => false,
                'is_active' => true,
                'primary_video_url' => null,
                'thumbnail_url' => null,
                'equipment' => ['Barbell'],
                'styles' => ['mixed'],
            ],
        ];

        foreach ($exercises as $exerciseData) {
            $requiredEquipment = $exerciseData['equipment'];
            $categorySlug = $exerciseData['category'];
            $exerciseStyles = $exerciseData['styles'];
            $instructionData = $exerciseData['instruction'] ?? null;
            unset($exerciseData['equipment']);
            unset($exerciseData['category']);
            unset($exerciseData['styles']);
            unset($exerciseData['instruction']);

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

            if ($instructionData !== null) {
                ExerciseInstruction::query()->updateOrCreate(
                    ['exercise_id' => $exercise->id],
                    $instructionData
                );
            }
        }
    }
}
