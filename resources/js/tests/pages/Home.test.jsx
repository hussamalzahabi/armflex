import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../../Pages/Home';

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
        render(<Home title="Dashboard" />);

        expect(screen.getAllByRole('heading', { name: 'Dashboard' }).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Test User/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/test@example.com/).length).toBeGreaterThan(0);
    });

    it('should_post_logout_request_when_logout_is_clicked', () => {
        render(<Home title="Dashboard" />);

        fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

        expect(logoutPostMock).toHaveBeenCalledWith('/logout');
    });
});
