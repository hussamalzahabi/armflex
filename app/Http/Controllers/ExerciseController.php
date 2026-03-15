<?php

namespace App\Http\Controllers;

use App\Models\Exercise;
use Inertia\Inertia;
use Inertia\Response;

class ExerciseController extends Controller
{
    public function show(Exercise $exercise): Response
    {
        $exercise->load([
            'category:id,name,slug',
            'equipments:id,name',
            'styles:id,name,slug',
            'instruction',
        ]);

        $primaryStyle = $this->primaryStyle($exercise);
        $relatedExercises = $this->relatedExercises($exercise);

        return Inertia::render('Exercises/Show', [
            'exercise' => [
                'id' => $exercise->id,
                'name' => $exercise->name,
                'slug' => $exercise->slug,
                'short_description' => $exercise->short_description,
                'purpose' => $exercise->purpose,
                'difficulty_level' => $exercise->difficulty_level,
                'is_beginner_friendly' => $exercise->is_beginner_friendly,
                'is_isometric' => $exercise->is_isometric,
                'primary_video_url' => $exercise->primary_video_url,
                'video_embed_url' => $this->videoEmbedUrl($exercise->primary_video_url),
                'thumbnail_url' => $exercise->thumbnail_url,
                'category' => $exercise->category ? [
                    'name' => $exercise->category->name,
                    'slug' => $exercise->category->slug,
                ] : null,
                'equipments' => $exercise->equipments
                    ->map(fn ($equipment) => ['id' => $equipment->id, 'name' => $equipment->name])
                    ->values()
                    ->all(),
                'styles' => $exercise->styles
                    ->map(fn ($style) => ['id' => $style->id, 'name' => $style->name, 'slug' => $style->slug])
                    ->values()
                    ->all(),
                'primary_style' => $primaryStyle ? [
                    'id' => $primaryStyle->id,
                    'name' => $primaryStyle->name,
                    'slug' => $primaryStyle->slug,
                ] : null,
                'instruction' => [
                    'setup_instructions' => $exercise->instruction?->setup_instructions,
                    'execution_steps' => $exercise->instruction?->execution_steps,
                    'coaching_cues' => $exercise->instruction?->coaching_cues,
                    'common_mistakes' => $exercise->instruction?->common_mistakes,
                    'why_it_matters' => $exercise->instruction?->why_it_matters,
                    'safety_notes' => $exercise->instruction?->safety_notes,
                ],
            ],
            'relatedExercises' => $relatedExercises
                ->map(fn (Exercise $relatedExercise) => [
                    'id' => $relatedExercise->id,
                    'name' => $relatedExercise->name,
                    'slug' => $relatedExercise->slug,
                    'short_description' => $relatedExercise->short_description,
                    'category' => $relatedExercise->category ? [
                        'name' => $relatedExercise->category->name,
                        'slug' => $relatedExercise->category->slug,
                    ] : null,
                ])
                ->values()
                ->all(),
        ]);
    }

    private function relatedExercises(Exercise $exercise)
    {
        if ($exercise->category_id === null) {
            return collect();
        }

        $primaryStyle = $this->primaryStyle($exercise);

        return Exercise::query()
            ->with(['category:id,name,slug', 'styles:id'])
            ->where('is_active', true)
            ->whereKeyNot($exercise->id)
            ->where('category_id', $exercise->category_id)
            ->get()
            ->sortBy([
                fn (Exercise $candidate) => $primaryStyle && $candidate->styles->contains('id', $primaryStyle->id) ? 0 : 1,
                fn (Exercise $candidate) => $candidate->name,
            ])
            ->take(5)
            ->values();
    }

    private function primaryStyle(Exercise $exercise)
    {
        return $exercise->styles
            ->sortBy([
                fn ($style) => in_array($style->slug, ['mixed', 'general'], true) ? 1 : 0,
                fn ($style) => $style->name,
            ])
            ->first();
    }

    private function videoEmbedUrl(?string $url): ?string
    {
        if ($url === null || trim($url) === '') {
            return null;
        }

        if (str_contains($url, 'youtube.com/embed/')) {
            return $url;
        }

        if (preg_match('~youtube\.com/watch\?v=([^&]+)~', $url, $matches) === 1) {
            return 'https://www.youtube.com/embed/'.$matches[1];
        }

        if (preg_match('~youtu\.be/([^?&/]+)~', $url, $matches) === 1) {
            return 'https://www.youtube.com/embed/'.$matches[1];
        }

        return null;
    }
}
