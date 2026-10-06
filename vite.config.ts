import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on GitLab Pages at any project path
export default defineConfig({ plugins: [react()], base: './' });
