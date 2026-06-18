import { defineConfig } from 'astro/config';

// imua.space — static output, deployed to Netlify.
// The IMUA book nests inside this master site; the PPVA demo is a separate project.
export default defineConfig({
  site: 'https://imua.space',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Allow Astro's built-in image optimization for local assets.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
