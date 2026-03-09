import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    test: {
        environment: 'happy-dom',
        setupFiles: ['./resources/js/tests/setup/setup.js'],
        include: ['resources/js/tests/**/*.{test,spec}.{js,jsx}'],
        clearMocks: true,
    },
});
