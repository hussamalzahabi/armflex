import { Button } from 'primereact/button';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <Button
            type="button"
            label={isDark ? 'Light mode' : 'Dark mode'}
            onClick={onToggle}
            severity="secondary"
            outlined={!isDark}
        />
    );
};

export default ThemeToggle;
