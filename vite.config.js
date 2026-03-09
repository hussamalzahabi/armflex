import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    if (id.includes('/primereact/')) {
                        return 'vendor-primereact';
                    }

                    if (id.includes('/axios/')) {
                        return 'vendor-axios';
                    }

                    return 'vendor';
                },
            },
        },
    },
    server: {
        host: 'armflex.test',
        watch: {
            usePolling: true,
        },
    },
});
