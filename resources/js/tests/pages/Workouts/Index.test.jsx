import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WorkoutsIndex from '../../../Pages/Workouts/Index';

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
            flash: {},
            errors: {},
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

vi.mock('primereact/message', () => ({
    Message: ({ text }) => <p>{text}</p>,
}));

vi.mock('primereact/datatable', () => ({
    DataTable: ({ children }) => <div>{children}</div>,
}));

vi.mock('primereact/column', () => ({
    Column: () => null,
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Workouts history page', () => {
    it('should_render_history_summary_and_workout_rows', () => {
        render(
            <WorkoutsIndex
                workouts={[
                    {
                        id: 1,
                        program: {
                            id: 7,
                            name: 'Mixed Intermediate Program',
                            style: 'mixed',
                            experience_level: 'intermediate',
                        },
                        day_number: 1,
                        started_at: '2026-03-12T10:00:00Z',
                        completed_at: null,
                        exercise_count: 3,
                        set_count: 10,
                        is_completed: false,
                    },
                ]}
            />
        );

        expect(screen.getByText('Workout History')).toBeInTheDocument();
        expect(screen.getByText('Mixed Intermediate Program')).toBeInTheDocument();
        expect(screen.getByText('Continue')).toBeInTheDocument();
    });
});
