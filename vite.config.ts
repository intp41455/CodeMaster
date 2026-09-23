import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // GitHub Pages 部署在 /gode/ 子路径下；生产构建用 base
  const isGH = process.env.GITHUB_ACTIONS === 'true';
  return {
    base: isGH ? '/gode/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr: false,
      watch: {
        usePolling: true,
      },
    },
  };
});
