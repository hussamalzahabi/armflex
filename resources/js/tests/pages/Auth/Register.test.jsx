import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Register from '../../../Pages/Auth/Register';

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
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
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

vi.mock('@/hooks/useTheme', () => ({
    useTheme: () => ({
        isDark: false,
        toggleTheme: vi.fn(),
    }),
}));

describe('Register page', () => {
    it('should_render_register_form_content', () => {
        render(<Register />);

        expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    it('should_post_register_request_when_form_is_submitted', () => {
        render(<Register />);

        fireEvent.click(screen.getByRole('button', { name: 'Register' }));

        expect(postMock).toHaveBeenCalledWith(
            '/register',
            expect.objectContaining({
                onFinish: expect.any(Function),
            })
        );
    });
});
