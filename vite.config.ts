import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Keine API-Keys mehr im Client-Code - alles zur Laufzeit injected
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        assetsInlineLimit: 4096,
        rollupOptions: {
          input: path.resolve(__dirname, 'index.html'),
          output: {
            entryFileNames: 'assets/[name].[hash].js',
            chunkFileNames: 'assets/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash].[ext]',
            manualChunks: undefined
          }
        },
        // Environment-Variablen komplett aus Build entfernen
        define: {
          'import.meta.env': '{}'
        }
      },
      publicDir: 'public'
    };
});
