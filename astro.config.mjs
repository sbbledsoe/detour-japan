import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://detourjapan.github.io',
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
