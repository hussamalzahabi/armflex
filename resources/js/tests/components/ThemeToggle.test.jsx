import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ThemeToggle from '../../Components/ThemeToggle';

vi.mock('primereact/inputswitch', () => ({
    InputSwitch: ({ checked, onChange, ...props }) => (
        <button
            type="button"
            aria-pressed={checked}
            onClick={() => onChange?.({ value: !checked })}
            {...props}
        />
    ),
}));

describe('ThemeToggle', () => {
    it('should_expose_toggle_theme_label', () => {
        render(<ThemeToggle isDark={false} onToggle={vi.fn()} />);

        expect(screen.getByRole('button', { name: 'Toggle theme' })).toBeInTheDocument();
    });

    it('should_call_toggle_handler_when_clicked', () => {
        const handleToggle = vi.fn();

        render(<ThemeToggle isDark onToggle={handleToggle} />);

        fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));

        expect(handleToggle).toHaveBeenCalledTimes(1);
    });
});
