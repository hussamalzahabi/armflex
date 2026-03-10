import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProgramsIndex from '../../../Pages/Programs/Index';

const { postMock } = vi.hoisted(() => ({
    postMock: vi.fn(),
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
        post: postMock,
        visit: vi.fn(),
    },
}));

vi.mock('primereact/button', () => ({
    Button: ({ label, type = 'button', onClick }) => (
        <button type={type} onClick={onClick}>
            {label}
        </button>
    ),
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

vi.mock('primereact/accordion', () => ({
    Accordion: ({ children }) => <div>{children}</div>,
    AccordionTab: ({ header, children }) => (
        <section>
            <h3>{header}</h3>
            {children}
        </section>
    ),
}));

vi.mock('primereact/avatar', () => ({
    Avatar: ({ label }) => <span>{label}</span>,
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

describe('Programs page', () => {
    it('should_render_program_studio_and_history_sections', () => {
        render(<ProgramsIndex programs={[]} profileSummary={{ exists: false }} />);

        expect(screen.getByText('Program Studio')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Generate Program' })).toBeInTheDocument();
        expect(screen.getByText('Program History')).toBeInTheDocument();
    });

    it('should_post_generate_request_when_generate_is_clicked', () => {
        render(<ProgramsIndex programs={[]} profileSummary={{ exists: false }} />);

        fireEvent.click(screen.getByRole('button', { name: 'Generate Program' }));

        expect(postMock).toHaveBeenCalledWith(
            '/programs/generate',
            {},
            expect.objectContaining({
                preserveScroll: true,
                onFinish: expect.any(Function),
            })
        );
    });
});
