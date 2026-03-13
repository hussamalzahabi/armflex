import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../../Pages/Home';

const onboardingChecklist = {
    completed_count: 2,
    total_count: 5,
    all_completed: false,
    items: [
        { key: 'training_profile_completed', label: 'Complete training profile', completed: true, action_url: '/profile' },
        { key: 'equipment_added', label: 'Add available equipment', completed: true, action_url: '/profile' },
        { key: 'program_generated', label: 'Generate first program', completed: false, action_url: '/programs' },
        { key: 'workout_started', label: 'Start first workout', completed: false, action_url: '/programs' },
        { key: 'workout_completed', label: 'Complete first workout', completed: false, action_url: '/workouts' },
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
        expect(screen.getByText('Complete your activation path.')).toBeInTheDocument();
        expect(screen.getAllByText('2 / 5 complete').length).toBeGreaterThan(0);
    });

    it('should_post_logout_request_when_logout_is_clicked', () => {
        render(<Home title="Dashboard" onboardingChecklist={onboardingChecklist} />);

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(logoutPostMock).toHaveBeenCalledWith('/logout');
    });

    it('should_render_onboarding_success_state_when_all_steps_are_complete', () => {
        render(<Home title="Dashboard" onboardingChecklist={completedChecklist} />);

        expect(screen.getByText("You're set to train.")).toBeInTheDocument();
        expect(screen.getByText('5 / 5 complete')).toBeInTheDocument();
    });
});
