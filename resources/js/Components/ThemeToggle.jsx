import { InputSwitch } from 'primereact/inputswitch';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <InputSwitch
            checked={isDark}
            onChange={onToggle}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="app-theme-toggle"
        />
    );
};

export default ThemeToggle;
