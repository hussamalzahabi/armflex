import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
    ],
    server: {
        host: 'armflex.test',
        watch: {
            usePolling: true,
        },
    },
});
