import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../../Pages/Home';

const onboardingChecklist = {
    completed_count: 2,
    total_count: 5,
    all_completed: false,
    items: [
        {
            key: 'training_profile_completed',
            label: 'Complete your training profile',
            description: 'Set your training level, style, and weekly schedule.',
            completed: true,
            action_url: '/profile',
            action_label: 'Open profile',
            completed_label: 'Training profile completed',
        },
        {
            key: 'equipment_added',
            label: 'Add your equipment',
            description: 'Tell us what tools you have so we can generate the right exercises.',
            completed: true,
            action_url: '/profile',
            action_label: 'Open equipment',
            completed_label: 'Equipment added',
        },
        {
            key: 'program_generated',
            label: 'Generate your first program',
            description: 'Create a personalized training template based on your profile.',
            completed: false,
            action_url: '/programs',
            action_label: 'Generate program',
            completed_label: 'First program generated',
        },
        {
            key: 'workout_started',
            label: 'Start your first workout',
            description: 'Begin your first training session from your generated program.',
            completed: false,
            action_url: '/programs',
            action_label: 'Start workout',
            completed_label: 'First workout started',
        },
        {
            key: 'workout_completed',
            label: 'Complete your first workout',
            description: 'Finish a session to unlock progress tracking and history.',
            completed: false,
            action_url: '/workouts',
            action_label: 'Open workouts',
            completed_label: 'First workout completed',
        },
    ],
};

const completedChecklist = {
    completed_count: 5,
    total_count: 5,
    all_completed: true,
    items: onboardingChecklist.items.map((item) => ({ ...item, completed: true })),
};

const { logoutPostMock } = vi.hoisted(() => ({
    logoutPostMock: vi.fn(),
}));

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
                completed_count: onboardingChecklist.completed_count,
                total_count: onboardingChecklist.total_count,
                all_completed: onboardingChecklist.all_completed,
            },
        },
    }),
    router: {
        post: logoutPostMock,
    },
}));

vi.mock('primereact/card', () => ({
    Card: ({ title, children }) => (
        <section>
            <h2>{title}</h2>
            {children}
        </section>
    ),
}));

vi.mock('primereact/button', () => ({
    Button: ({ label, type = 'button', onClick }) => (
        <button type={type} onClick={onClick}>
            {label}
        </button>
    ),
}));

vi.mock('primereact/avatar', () => ({
    Avatar: ({ label }) => <span>{label}</span>,
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Home page', () => {
    it('should_render_authenticated_user_summary', () => {
        render(<Home title="Dashboard" onboardingChecklist={onboardingChecklist} />);

        expect(screen.getAllByRole('heading', { name: 'Dashboard' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Test User/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/test@example.com/).length).toBeGreaterThan(0);
        expect(screen.getByText('Get started with your training')).toBeInTheDocument();
        expect(screen.getAllByText('Progress: 2 / 5 steps completed').length).toBeGreaterThan(0);
        expect(screen.getByText('Create a personalized training template based on your profile.')).toBeInTheDocument();
        expect(screen.getByText('✓ Training profile completed')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Generate program' })).toBeInTheDocument();
    });

    it('should_post_logout_request_when_logout_is_clicked', () => {
        render(<Home title="Dashboard" onboardingChecklist={onboardingChecklist} />);

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(logoutPostMock).toHaveBeenCalledWith('/logout');
    });

    it('should_render_onboarding_success_state_when_all_steps_are_complete', () => {
        render(<Home title="Dashboard" onboardingChecklist={completedChecklist} />);

        expect(screen.getByText("You're ready to train")).toBeInTheDocument();
        expect(screen.getByText('Progress: 5 / 5 steps completed')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Start workout' })).toBeInTheDocument();
    });
});
