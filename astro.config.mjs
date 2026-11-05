// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://uneescalegourmande.fr',
  integrations: [sitemap({ filter: page => !new URL(page).pathname.startsWith('/questionnaire-fetes') })],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});
