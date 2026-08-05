// vite.config.ts - Vite Configuration for Levelo JS Test Environment
import { defineConfig } from 'vite';
import { leveloPlugin } from 'vite-plugin-levelojs';
import leveloConfig from './levelo.config.js';

export default defineConfig({
  plugins: [
    leveloPlugin()
  ],
  base: './',
  ...leveloConfig,
  server: {
    port: 6262
  },
});
