import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Edit from '../../../Pages/Profile/Edit';

const putMock = vi.fn();
const setDataMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, href, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    useForm: () => ({
        data: {
            dominant_arm: 'right',
            experience_level: 'beginner',
            style: 'toproll',
            weight_kg: 90,
            training_days_per_week: 4,
            notes: '',
            equipment_ids: [],
        },
        setData: setDataMock,
        put: putMock,
        processing: false,
        errors: {},
    }),
    usePage: () => ({
        props: {
            auth: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com',
                },
            },
        },
    }),
    router: {
        visit: vi.fn(),
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

vi.mock('primereact/dropdown', () => ({
    Dropdown: ({ id, value, onChange }) => <input id={id} value={value} onChange={(event) => onChange({ value: event.target.value })} />,
}));

vi.mock('primereact/inputnumber', () => ({
    InputNumber: ({ inputId, value, onValueChange }) => (
        <input id={inputId} type="number" value={value ?? ''} onChange={(event) => onValueChange({ value: Number(event.target.value) })} />
    ),
}));

vi.mock('primereact/inputtextarea', () => ({
    InputTextarea: ({ id, value, onChange }) => <textarea id={id} value={value} onChange={onChange} />,
}));

vi.mock('primereact/checkbox', () => ({
    Checkbox: ({ inputId, checked, onChange }) => (
        <input
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange({ checked: event.target.checked })}
        />
    ),
}));

vi.mock('primereact/toast', () => ({
    Toast: Object.assign(React.forwardRef(function ToastMock() {
        return null;
    }), { displayName: 'ToastMock' }),
}));

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Profile edit page', () => {
    const equipmentCategories = [
        {
            id: 'general',
            name: 'General Gym Equipment',
            items: [{ id: 1, name: 'Dumbbells' }],
        },
    ];
    const styleOptions = [
        { label: 'Toproll', value: 'toproll' },
        { label: 'Hook', value: 'hook' },
    ];

    it('should_render_equipment_and_profile_form_sections', () => {
        render(
            <Edit
                profile={null}
                styleOptions={styleOptions}
                equipmentCategories={equipmentCategories}
                selectedEquipmentIds={[]}
            />
        );

        expect(screen.getAllByRole('heading', { name: 'Training Profile' }).length).toBeGreaterThan(0);
        expect(screen.getByText('Style')).toBeInTheDocument();
        expect(screen.getByText('Toproll')).toBeInTheDocument();
        expect(screen.getByText('Equipment available')).toBeInTheDocument();
        expect(screen.getByText('General Gym Equipment')).toBeInTheDocument();
        expect(screen.getByText('Dumbbells')).toBeInTheDocument();
    });

    it('should_put_profile_request_when_save_is_submitted', () => {
        render(
            <Edit
                profile={null}
                styleOptions={styleOptions}
                equipmentCategories={equipmentCategories}
                selectedEquipmentIds={[]}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));

        expect(putMock).toHaveBeenCalledWith(
            '/profile',
            expect.objectContaining({
                onSuccess: expect.any(Function),
            })
        );
    });
});
