import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://detour-japan.github.io',
  output: 'static',
  build: {
    assets: 'assets'
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark'
    }
  }
});
