import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExercisesShow from '../../../Pages/Exercises/Show';

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, href, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    usePage: () => ({
        props: {
            auth: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
            onboardingStatus: {
                completed_count: 0,
                total_count: 5,
                all_completed: false,
            },
        },
    }),
}));

vi.mock('primereact/card', () => ({
    Card: ({ children }) => <section>{children}</section>,
}));

vi.mock('primereact/chip', () => ({
    Chip: ({ label }) => <span>{label}</span>,
}));

vi.mock('primereact/tag', () => ({
    Tag: ({ value }) => <span>{value}</span>,
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Exercise detail page', () => {
    it('should_render_beginner_friendly_exercise_content', () => {
        render(
            <ExercisesShow
                exercise={{
                    id: 7,
                    name: 'Band Pronation Pulses',
                    slug: 'band-pronation-pulses',
                    short_description: 'A simple pronation drill.',
                    purpose: 'Build hand turnover.',
                    difficulty_level: 'beginner',
                    is_beginner_friendly: true,
                    is_isometric: false,
                    primary_video_url: null,
                    video_embed_url: null,
                    thumbnail_url: null,
                    category: { name: 'Pronation', slug: 'pronation' },
                    primary_style: { id: 1, name: 'Toproll', slug: 'toproll' },
                    equipments: [{ id: 1, name: 'Resistance Bands' }],
                    styles: [{ id: 1, name: 'Toproll', slug: 'toproll' }],
                    instruction: {
                        setup_instructions: 'Anchor the band low.',
                        execution_steps: 'Rotate through the thumb.',
                        coaching_cues: 'Stay crisp.',
                        common_mistakes: 'Do not shrug.',
                        why_it_matters: 'Pronation helps you keep your hand.',
                        safety_notes: 'Use light tension first.',
                    },
                }}
                relatedExercises={[
                    {
                        id: 8,
                        name: 'Cable Pronation Pull',
                        slug: 'cable-pronation-pull',
                        short_description: 'A related pronation movement.',
                        category: { name: 'Pronation', slug: 'pronation' },
                    },
                ]}
            />
        );

        expect(screen.getByRole('heading', { level: 1, name: 'Band Pronation Pulses' })).toBeInTheDocument();
        expect(screen.getByText('A simple pronation drill.')).toBeInTheDocument();
        expect(screen.getByText('Build hand turnover.')).toBeInTheDocument();
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Friendly')).toBeInTheDocument();
        expect(screen.getByText('Primary style')).toBeInTheDocument();
        expect(screen.getByText('Resistance Bands')).toBeInTheDocument();
        expect(screen.getAllByText('Toproll').length).toBeGreaterThan(0);
        expect(screen.getByText('Start here')).toBeInTheDocument();
        expect(screen.getByText('Setup instructions')).toBeInTheDocument();
        expect(screen.getByText('Anchor the band low.')).toBeInTheDocument();
        expect(screen.getByText('Related Exercises')).toBeInTheDocument();
        expect(screen.getByText('Cable Pronation Pull')).toBeInTheDocument();
    });
});
