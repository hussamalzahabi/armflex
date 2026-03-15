import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WorkoutsShow from '../../../Pages/Workouts/Show';

const { axiosPatchMock, inertiaPostMock } = vi.hoisted(() => ({
    axiosPatchMock: vi.fn(() => Promise.resolve({ data: {} })),
    inertiaPostMock: vi.fn(),
}));

vi.mock('axios', () => ({
    default: {
        patch: axiosPatchMock,
    },
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
            flash: {},
            errors: {},
        },
    }),
    router: {
        post: inertiaPostMock,
        visit: vi.fn(),
    },
}));

vi.mock('primereact/button', () => ({
    Button: ({ label, type = 'button', onClick, disabled }) => (
        <button type={type} onClick={onClick} disabled={disabled}>
            {label}
        </button>
    ),
}));

vi.mock('primereact/card', () => ({
    Card: ({ children }) => <section>{children}</section>,
}));

vi.mock('primereact/dialog', () => ({
    Dialog: ({ visible, header, children, footer }) =>
        visible ? (
            <section role="dialog" aria-label={header}>
                <h2>{header}</h2>
                <div>{children}</div>
                <div>{footer}</div>
            </section>
        ) : null,
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

vi.mock('primereact/toast', () => ({
    Toast: Object.assign(React.forwardRef(function ToastMock() {
        return null;
    }), { displayName: 'ToastMock' }),
}));

vi.mock('primereact/tooltip', () => ({
    Tooltip: () => null,
}));

vi.mock('primereact/overlaypanel', () => ({
    OverlayPanel: React.forwardRef(function OverlayPanelMock(_props, _ref) {
        return null;
    }),
}));

vi.mock('primereact/inputnumber', () => ({
    InputNumber: ({ value, onValueChange, onBlur, placeholder, disabled }) => (
        <input
            aria-label={placeholder}
            value={value ?? ''}
            disabled={disabled}
            onChange={(event) => onValueChange?.({ value: event.target.value === '' ? null : Number(event.target.value) })}
            onBlur={onBlur}
        />
    ),
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Workout session page', () => {
    it('should_show_save_failure_feedback_when_set_update_is_rejected', async () => {
        axiosPatchMock.mockRejectedValueOnce({
            response: {
                data: {
                    errors: {
                        reps: ['Reps must be a valid number.'],
                    },
                },
            },
        });

        render(<WorkoutsShow workout={buildWorkout()} />);

        const repsInput = screen.getByLabelText('Reps');

        fireEvent.change(repsInput, { target: { value: '9' } });
        fireEvent.blur(repsInput);

        expect(await screen.findByText('Save failed')).toBeInTheDocument();
        expect(await screen.findByText('Reps must be a valid number.')).toBeInTheDocument();
    });

    it('should_render_workout_session_and_finish_action', () => {
        render(<WorkoutsShow workout={buildWorkout()} />);

        expect(screen.getByText('Workout Session')).toBeInTheDocument();
        expect(
            screen
                .getAllByRole('link', { name: 'Mixed Intermediate Program' })
                .some((link) => link.getAttribute('href') === '/programs?program=7')
        ).toBe(true);
        expect(screen.getByText(/— Day 1/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Finish Workout' })).toBeInTheDocument();
    });

    it('should_show_reopen_action_for_completed_workouts', () => {
        render(<WorkoutsShow workout={buildWorkout({ completedAt: '2026-03-12T11:00:00Z', reps: 9 })} />);

        expect(screen.getByText('This workout is completed. Values are now locked.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reopen Workout' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Finish Workout' })).not.toBeInTheDocument();
    });

    it('should_disable_finish_when_no_results_have_been_logged', () => {
        render(<WorkoutsShow workout={buildWorkout()} />);

        expect(screen.getByRole('button', { name: 'Finish Workout' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Why Finish Workout is disabled' })).toBeInTheDocument();
    });

    it('should_save_set_values_on_blur', async () => {
        render(<WorkoutsShow workout={buildWorkout()} />);

        const repsInput = screen.getByLabelText('Reps');

        fireEvent.change(repsInput, { target: { value: '9' } });
        fireEvent.blur(repsInput);

        expect(axiosPatchMock).toHaveBeenCalledWith('/workout-sets/102', {
            reps: 9,
            weight: null,
            duration_seconds: null,
        });
    });

    it('should_post_finish_request_when_finish_workout_is_clicked', async () => {
        render(<WorkoutsShow workout={buildWorkout({ reps: 9 })} />);

        fireEvent.click(screen.getByRole('button', { name: 'Finish Workout' }));
        const dialog = screen.getByRole('dialog', { name: 'Finish workout?' });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Finish Workout' }));

        await waitFor(() => {
            expect(inertiaPostMock).toHaveBeenCalledWith(
                '/workouts/55/finish',
                {},
                expect.objectContaining({
                    preserveScroll: true,
                    onFinish: expect.any(Function),
                })
            );
        });
    });

    it('should_persist_dirty_sets_before_finishing_workout', async () => {
        render(<WorkoutsShow workout={buildWorkout()} />);

        const repsInput = screen.getByLabelText('Reps');

        fireEvent.change(repsInput, { target: { value: '12' } });
        fireEvent.click(screen.getByRole('button', { name: 'Finish Workout' }));
        const dialog = screen.getByRole('dialog', { name: 'Finish workout?' });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Finish Workout' }));

        await waitFor(() => {
            expect(axiosPatchMock).toHaveBeenCalledWith('/workout-sets/102', {
                reps: 12,
                weight: null,
                duration_seconds: null,
            });
        });

        await waitFor(() => {
            expect(inertiaPostMock).toHaveBeenCalledWith(
                '/workouts/55/finish',
                {},
                expect.objectContaining({
                    preserveScroll: true,
                    onFinish: expect.any(Function),
                })
            );
        });
    });

    it('should_post_reopen_request_when_reopen_workout_is_confirmed', async () => {
        render(<WorkoutsShow workout={buildWorkout({ completedAt: '2026-03-12T11:00:00Z', reps: 9 })} />);

        fireEvent.click(screen.getByRole('button', { name: 'Reopen Workout' }));
        const dialog = screen.getByRole('dialog', { name: 'Reopen workout?' });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Reopen Workout' }));

        await waitFor(() => {
            expect(inertiaPostMock).toHaveBeenCalledWith(
                '/workouts/55/reopen',
                {},
                expect.objectContaining({
                    preserveScroll: true,
                    onFinish: expect.any(Function),
                })
            );
        });
    });
});

const buildWorkout = ({ reps = null, completedAt = null } = {}) => ({
    id: 55,
    program: {
        id: 7,
        name: 'Mixed Intermediate Program',
        style: 'mixed',
        experience_level: 'intermediate',
        training_days: 3,
        duration_weeks: 4,
    },
    program_day: {
        id: 11,
        day_number: 1,
    },
    started_at: '2026-03-12T10:00:00Z',
    completed_at: completedAt,
    notes: null,
    exercises: [
        {
            id: 99,
            order_index: 1,
            prescription: {
                sets: 4,
                reps: '6-8',
                is_duration_based: false,
            },
            exercise: {
                id: 5,
                name: 'Band Pronation Pulses',
                slug: 'band-pronation-pulses',
                difficulty_level: 'beginner',
                category: { name: 'Pronation', slug: 'pronation' },
                equipments: [{ id: 1, name: 'Resistance Bands' }],
            },
            sets: [
                { id: 102, set_number: 1, reps, weight: null, duration_seconds: null, notes: null },
            ],
        },
    ],
});
