import { defineConfig } from 'vite';

// configure-pages supplies the repository subpath (or an empty path for a custom domain).
// Local development and ordinary builds keep the root URL.
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || '/',
});
