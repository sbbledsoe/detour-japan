import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://sbbledsoe.github.io',
  base: '/detour-japan',
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
