import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/crimes/', // Assicurati di impostare il percorso base corretto
  plugins: [react()],
});