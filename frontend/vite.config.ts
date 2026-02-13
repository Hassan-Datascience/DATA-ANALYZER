import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite configuration for Cyber-Emerald Dashboard
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            onwarn(warning, warn) {
                // Suppress all TypeScript warnings during build
                if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return;
                if (warning.code === 'THIS_IS_UNDEFINED') return;
                // Suppress all warnings
                return;
            }
        }
    },
    esbuild: {
        logOverride: { 'this-is-undefined': 'silent' }
    }
})
