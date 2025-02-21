import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import './src/main.tsx';

export default defineConfig({
  base: '/crimes/', // Assicurati di impostare il percorso base corretto
  plugins: [react()],
});