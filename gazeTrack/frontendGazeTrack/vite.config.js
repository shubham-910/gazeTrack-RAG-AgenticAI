import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// Vite configuration for the Micro-frontend (MFE) Host Shell
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'gaze_shell',
      filename: 'remoteEntry.js',
      // MFE Remotes: The host shell pulls dynamically compiled bundles from separate micro-services
      remotes: {
        mfe_dashboard: 'http://localhost:3001/assets/remoteEntry.js',
        mfe_tracker: 'http://localhost:3002/assets/remoteEntry.js',
      },
      // Shared libraries to ensure single-instance loads and prevent runtime library collisions
      shared: ['react', 'react-dom', 'react-router-dom', 'tailwindcss'],
    }),
  ],
  server: {
    port: 3000, // Host shell port
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
