import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' => funciona em qualquer subcaminho do GitHub Pages
// (https://usuario.github.io/repositorio/) sem precisar saber o nome do repositório.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
