import { Button } from 'primereact/button';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <Button
            type="button"
            label={isDark ? 'Light mode' : 'Dark mode'}
            icon={isDark ? 'pi pi-sun' : 'pi pi-moon'}
            onClick={onToggle}
            size="small"
            outlined
            className="app-theme-toggle"
        />
    );
};

export default ThemeToggle;
