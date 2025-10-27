import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['../vitest.setup.ts'], // Relative path to root setup file
    globals: true,
    include: ['**/*.test.{ts,tsx}'],
  },
});
