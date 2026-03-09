import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

const GlobalThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="fixed right-4 top-4 z-50">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
    );
};

export default GlobalThemeToggle;
