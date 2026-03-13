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

const buildActivityDays = () => {
    const startDate = new Date(2026, 0, 17);

    return Array.from({ length: 56 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return {
            date: `${year}-${month}-${day}`,
            active: index % 4 === 0,
        };
    });
};

const trainingStreak = {
    current_streak: 2,
    longest_streak: 6,
    message: 'Nice momentum. Keep showing up.',
    activity_days: buildActivityDays(),
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
        render(<Home title="Dashboard" onboardingChecklist={onboardingChecklist} trainingStreak={trainingStreak} />);

        expect(screen.getAllByRole('heading', { name: 'Dashboard' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Test User/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/test@example.com/).length).toBeGreaterThan(0);
        expect(screen.getByText('Get started with your training')).toBeInTheDocument();
        expect(screen.getAllByText('Progress: 2 / 5 steps completed').length).toBeGreaterThan(0);
        expect(screen.getByText('Create a personalized training template based on your profile.')).toBeInTheDocument();
        expect(screen.getByText('✓ Training profile completed')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Generate program' })).toBeInTheDocument();
        expect(screen.getByText('Training Streak')).toBeInTheDocument();
        expect(screen.getByText('Current streak')).toBeInTheDocument();
        expect(screen.getByText('Fri')).toBeInTheDocument();
        expect(screen.getByLabelText('Training activity grid')).toBeInTheDocument();
    });

    it('should_post_logout_request_when_logout_is_clicked', () => {
        render(<Home title="Dashboard" onboardingChecklist={onboardingChecklist} trainingStreak={trainingStreak} />);

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(logoutPostMock).toHaveBeenCalledWith('/logout');
    });

    it('should_render_onboarding_success_state_when_all_steps_are_complete', () => {
        render(<Home title="Dashboard" onboardingChecklist={completedChecklist} trainingStreak={trainingStreak} />);

        expect(screen.getByText("You're ready to train")).toBeInTheDocument();
        expect(screen.getByText('Progress: 5 / 5 steps completed')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Start workout' })).toBeInTheDocument();
    });
});
