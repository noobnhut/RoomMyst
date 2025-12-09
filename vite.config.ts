import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_KEY': JSON.stringify(env.SUPABASE_KEY),
      'process.env.VITE_ENCRYPTION_KEY': JSON.stringify(env.VITE_ENCRYPTION_KEY),
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase-core': ['@supabase/supabase-js'],
            'genai-sdk': ['@google/genai'],
            'crypto-utils': ['crypto-js'],
            'ui-kit': ['./components/UIComponents.tsx'],
            'services-auth': ['./services/auth.ts'],
            'services-content': ['./services/content.ts', './services/gemini.ts'],
          },
        },
      },
    },
  };
});