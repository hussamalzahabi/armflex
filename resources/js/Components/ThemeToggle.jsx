import { InputSwitch } from 'primereact/inputswitch';

const ThemeToggle = ({ isDark, onToggle }) => {
    return (
        <div className="app-theme-toggle-wrap" title="Toggle theme">
            <i className={`pi pi-sun app-theme-toggle-icon ${!isDark ? 'is-active' : ''}`} aria-hidden="true" />
            <InputSwitch
                checked={isDark}
                onChange={onToggle}
                aria-label="Toggle theme"
                className="app-theme-toggle"
            />
            <i className={`pi pi-moon app-theme-toggle-icon ${isDark ? 'is-active' : ''}`} aria-hidden="true" />
        </div>
    );
};

export default ThemeToggle;
