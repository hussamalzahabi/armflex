import { useEffect, useState } from 'react';
import { ThemeContext } from '@/context/theme-context';

const THEME_STORAGE_KEY = 'armflex-theme';

const getInitialTheme = () => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
    };

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.classList.toggle('dark', isDark);
        document.documentElement.dataset.theme = theme;
    }, [theme, isDark]);

    return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
