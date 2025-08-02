import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing required environment variables: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY');
  }

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: supabaseUrl ? {
        '/functions/v1': {
          target: supabaseUrl,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey
          },
          timeout: 120000,
          proxyTimeout: 120000
        }
      } : undefined,
      hmr: {
        overlay: false
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
          customer: './customer.html'
        }
      }
    }
  };
});