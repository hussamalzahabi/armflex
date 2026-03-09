import './bootstrap';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import GlobalThemeToggle from './Components/GlobalThemeToggle';
import { ThemeProvider } from './hooks/useTheme';

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob(['./Pages/**/*.jsx', '!./Pages/**/*.test.{js,jsx}', '!./Pages/**/*.spec.{js,jsx}']);
        const resolvePage = pages[`./Pages/${name}.jsx`];

        if (!resolvePage) {
            throw new Error(`Page not found: ${name}`);
        }

        return resolvePage().then((module) => module.default);
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
