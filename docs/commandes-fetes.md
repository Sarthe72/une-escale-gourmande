# Parcours de commande des fêtes

La description de la livraison et de l’activation est dans [LIVRAISON-FETES-2026.md](./LIVRAISON-FETES-2026.md).

## Recette locale

1. `npm run build`, puis `npm test`.
2. `.dev.vars` ignoré par Git contient la clé de test `HOLIDAY_ADMIN_KEY`, sans réutiliser une clé de production.
3. `npx wrangler d1 migrations apply holiday-orders-local --local --config wrangler.orders-local.jsonc`.
4. `npx wrangler dev --config wrangler.orders-local.jsonc --port 8791`.
5. `node scripts/test-holiday-api.mjs` teste le stockage partagé, la facturation et les corrections avec des coordonnées fictives.
6. Ouvrir `http://127.0.0.1:8791/menu-fetes/`. L’ancienne page `/commande-fetes/` reste une vue de test simple, sans lien dans la navigation.
7. Côté CRM, définir `ORDERS_LOCAL=true` et `VITE_ORDERS_API=http://127.0.0.1:8791/api/holiday`, puis `npm run dev`. Le CRM complet se connecte une seule fois à la clé de test. `/visiteur.html#/commandes` est la simulation isolée sans connexion.

La configuration locale ouvre les commandes fictives et définit des heures limites de test. Elle ne doit jamais être utilisée pour un déploiement réel. Les identifiants de base, clés, factures et commandes locales ne doivent pas être copiés en production.
