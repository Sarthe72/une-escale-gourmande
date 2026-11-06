# Livraison préparée — menus des fêtes et Escale Pro

État : version de validation locale. Aucun déploiement, aucune ouverture des commandes publiques, aucune modification des données du CRM en ligne.

## Ce qui est développé

- Page festive approuvée intégrée au site : `/menu-fetes/`, panier, coordonnées obligatoires nom/prénom/téléphone, e-mail facultatif, précisions, retrait et paiement. Prix serveur : 10 €, 9 €, 14 €, 15 €, 5,50 €, 5,50 €. Le nom du poisson reste générique.
- Invitation intégrée à la photo d’accueil en décembre et jusqu’au 5 janvier, activable sans afficher la campagne avant validation.
- Stockage partagé D1 pour les commandes, la facturation et l’historique des corrections. Les dates, prix et quantités sont vérifiés côté serveur. Les nouvelles tentatives identiques ne créent pas de doublon.
- Une connexion sécurisée à l’entrée d’Escale Pro, pour toutes ses rubriques. Pas de connexion distincte aux commandes. Le PIN historique reste dans les données locales, mais cette version utilise une clé d’accès serveur unique plutôt que ce PIN local comme authentification. La clé de production devra être configurée au lancement.
- Commandes web, téléphone et e-mail dans la même liste. Saisie manuelle et reprise des coordonnées d’un client déjà présent dans les commandes.
- Validation groupée paiement/retrait, commandes terminées en bas avec badge vert, correction discrète et réversible. Les modifications simultanées sont détectées par version.
- Factures partagées créées dans la même transaction que la validation. Une seule facture par commande, numérotation serveur `FAC-NOEL-000001…`, contenu et numéro immuables. Une correction conserve la facture et annule son état réglé ; une nouvelle validation reprend la même facture et ne consomme pas un numéro supplémentaire.
- La facture est accessible dans la commande et dans Factures ; elle est imprimable/exportable en PDF. Le paiement d’une facture de commande se corrige depuis la commande liée, pas dans une copie locale.
- Clients séparés Traiteur/Chambre/Commandes. Bilan Noël séparé du traiteur, uniquement payé ET retiré, daté du retrait, avec campagne décembre/janvier réunie. La facture n’est pas ajoutée une seconde fois au bilan des prestations.
- Mode visiteur séparé, données fictives, simulation des commandes et factures d’exemple. Aucun accès aux données serveur depuis ce mode.

Les devis, factures manuelles et anciens clients du CRM restent dans leur stockage local actuel. Cette livraison partage les commandes et les factures qui en découlent ; elle ne migre pas silencieusement les anciens documents.

## Paramètres à valider avant activation

1. Nom définitif du poisson, formulation coppa/jambon et informations d’allergènes.
2. Heure exacte des clôtures des 21 et 28 décembre (les heures de la configuration locale ne sont que des valeurs de test).
3. Modèle de facture, coordonnées, régime de TVA et série de numérotation à confirmer avant émission réelle. Le serveur refuse l’encaissement tant que `HOLIDAY_VAT_MODE=exempt_293b` n’a pas été explicitement configuré ; ce mode correspond au modèle historique du CRM et ne doit être activé qu’après confirmation.
4. Durée de conservation des coordonnées et information de confidentialité adaptée à la prise de commande.
5. Alerte de nouvelle commande : le bouton Actualiser fonctionne. Le choix d’une alerte hors CRM reste ouvert ; aucun envoi automatique d’e-mail n’est activé ni revendiqué dans cette livraison.

## Mise en ligne, uniquement après validation

Conserver une sauvegarde des exports locaux de Benjamin et de la version déployée du CRM avant remplacement. Les données de son navigateur ne doivent pas être supprimées.

### Site / Cloudflare

- Créer une base D1 de production distincte de la base de test, sur le compte existant et sans passage à un forfait payant.
- Dans `wrangler.jsonc`, ajouter `d1_databases` avec `binding: HOLIDAY_DB`, le vrai `database_id`, le nom et `migrations_dir: migrations`. Ne jamais utiliser l’identifiant fictif de `wrangler.orders-local.jsonc` en production.
- Appliquer les migrations 0001, 0002, 0003 à cette base. Ne pas copier la base locale : elle contient exclusivement des tests.
- Configurer `HOLIDAY_ADMIN_KEY` comme secret serveur, avec une valeur aléatoire forte d’au moins 32 caractères. Ne pas réutiliser la clé locale, ne pas la mettre dans Git, les fichiers publics, les variables VITE ou une URL.
- Variables : `HOLIDAY_ALLOWED_ORIGINS=https://sarthe72.github.io`, les deux échéances `HOLIDAY_DEADLINE_CHRISTMAS` / `HOLIDAY_DEADLINE_NEWYEAR` avec fuseau explicite, et le mode de facturation validé.
- Déployer d’abord avec `HOLIDAY_CAMPAIGN_VISIBLE=false` et `HOLIDAY_ORDERS_OPEN=false`. Vérifier l’accès administrateur, les migrations et le modèle de facture sans envoyer de commande réelle.
- Activer `HOLIDAY_CAMPAIGN_VISIBLE=true` pour afficher la page ; activer ensuite `HOLIDAY_ORDERS_OPEN=true` au moment convenu. Le bandeau d’accueil reste limité à la période décembre–5 janvier.
- `npm ci`, `npm test`, `npm run build`, puis le déploiement existant. Attention : un push sur master peut déclencher automatiquement la publication ; aucun push n’a été effectué pour cette livraison.

### Escale Pro / GitHub Pages

- `VITE_ORDERS_API=https://uneescalegourmande.fr/api/holiday` est l’URL par défaut. Ne pas compiler avec l’adresse locale de test.
- `npm ci`, `node --test tests/*.test.js`, `npm run build`. Le dossier `dist` est la version statique du CRM ; ses routes utilisent le hash pour les rechargements GitHub Pages.
- Publier cette version sur l’hébergement existant seulement après validation. La rubrique visiteur reste une démonstration sans données réelles.
- Tester avec Benjamin sa nouvelle connexion unique, une commande manuelle, un retrait, une correction et la facture liée. Les commandes publiques doivent encore être fermées pendant la recette.

## Vérifications et retour arrière

Tests locaux : validation des coordonnées/prix/dates, accès anonyme refusé, origines refusées, anti-doublon, saisie manuelle authentifiée, session révoquée, facture unique et persistante, correction/revalidation sans nouveau numéro, bilan Noël sans double comptage. Un parcours navigateur a confirmé la commande depuis la page festive jusque dans sa facture partagée après rechargement complet.

Retour arrière : fermer `HOLIDAY_ORDERS_OPEN` puis masquer la campagne, conserver la base et son historique, restaurer les fichiers de la version précédente. Ne pas supprimer la base ni les factures émises. Les alertes de dépendances CRM ont été corrigées par mises à jour compatibles ; l’audit du 6 novembre 2026 ne signale plus de vulnérabilité.
