// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://uneescalegourmande.fr',
  integrations: [sitemap({ filter: page => !['/questionnaire-fetes', '/commande-fetes'].some(path => new URL(page).pathname.startsWith(path)) })],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});
