import './bootstrap';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import GlobalThemeToggle from './Components/GlobalThemeToggle';
import { ThemeProvider } from './hooks/useTheme';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <GlobalThemeToggle />
                <App {...props} />
            </ThemeProvider>
        );
    },
});
