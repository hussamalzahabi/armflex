import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Login from '../../../Pages/Auth/Login';

const postMock = vi.fn();
const resetMock = vi.fn();

vi.mock('@inertiajs/react', () => ({
    Head: () => null,
    Link: ({ children, href, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    useForm: () => ({
        data: {
            email: '',
            password: '',
            remember: false,
        },
        setData: vi.fn(),
        post: postMock,
        processing: false,
        errors: {},
        reset: resetMock,
    }),
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

vi.mock('primereact/inputtext', () => ({
    InputText: ({ id, value, onChange, type = 'text' }) => <input id={id} type={type} value={value} onChange={onChange} />,
}));

vi.mock('primereact/password', () => ({
    Password: ({ id, value, onChange }) => <input id={id} type="password" value={value} onChange={onChange} />,
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

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Login page', () => {
    it('should_render_login_form_content', () => {
        render(<Login />);

        expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should_post_login_request_when_form_is_submitted', () => {
        render(<Login />);

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        expect(postMock).toHaveBeenCalledWith(
            '/login',
            expect.objectContaining({
                onFinish: expect.any(Function),
            })
        );
    });
});
