import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ThemeToggle from '../../Components/ThemeToggle';

vi.mock('primereact/button', () => ({
    Button: ({ label, onClick, type = 'button' }) => (
        <button type={type} onClick={onClick}>
            {label}
        </button>
    ),
}));

describe('ThemeToggle', () => {
    it('should_show_dark_mode_label_when_theme_is_light', () => {
        render(<ThemeToggle isDark={false} onToggle={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument();
    });

    it('should_call_toggle_handler_when_clicked', () => {
        const handleToggle = vi.fn();

        render(<ThemeToggle isDark onToggle={handleToggle} />);

        fireEvent.click(screen.getByRole('button', { name: 'Light mode' }));

        expect(handleToggle).toHaveBeenCalledTimes(1);
    });
});
