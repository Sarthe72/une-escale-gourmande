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

## Décors Noël — ivoire, sapin givré et champagne

- Accueil : guirlande sur la photo existante, invitation aux menus intégrée dans un bandeau ivoire/champagne et composition de bougies avant le contact.
- Le Chef : branches légères au-dessus du portrait et séparation végétale avant les valeurs.
- Chambre : guirlande givrée sur la photo, composition de bougies avant la réservation.
- Traiteur : feuillage et lumières sur le visuel d’ouverture, séparation végétale avant le contact.
- Menu Truffe : guirlande champagne sur la photo, bougies avant la réservation.
- Contact : coins végétaux discrets, sans superposition sur les champs du formulaire.
- Logo, navigation et pied de page : touches coordonnées ; les pages légales gardent uniquement cet habillage léger. La page Menu des fêtes approuvée conserve son décor propre.

Affichage automatique du 1er décembre au 5 janvier inclus, dans le fuseau Europe/Paris, indépendamment de l’ouverture des commandes. Les images décoratives sont sans attribut src hors saison ; elles ne sont chargées qu’à l’activation, avec variantes responsives et chargement différé pour les éléments plus bas. Les vrais visuels du lieu sont conservés. Les compositions décoratives sont des créations d’ambiance, pas des photos du domaine. Aucun script d’animation de particules ni bibliothèque supplémentaire.

Les nouveaux fichiers WebP pèsent environ 196 Ko pour la guirlande 1440 px (57 Ko en 720 px), et 56 Ko pour les bougies 640 px (19 Ko en 320 px). Ils sont réutilisés entre pages. Les décors sont non interactifs et masqués aux technologies d’assistance. La présence de la saison est définie avant le premier affichage pour réserver les espaces des séparateurs.

Recette locale : `npm run dev -- --host 127.0.0.1 --port 8793`, puis `/?preview=christmas`. Ce paramètre d’aperçu fonctionne uniquement en développement. La navigation conserve l’aperçu d’une page à l’autre. En production, le calendrier réel s’applique toujours.

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

Retour arrière : fermer `HOLIDAY_ORDERS_OPEN` puis masquer la campagne, conserver la base et son historique, restaurer les fichiers de la version précédente. Ne pas supprimer la base ni les factures émises.

Le site a été mis à jour vers Astro 7.4.7 avec l’adaptateur Cloudflare 14.4.6, Wrangler 4.158.0 et Vite 8.3.6. Les compilations et les 64 tests du site passent après cette mise à jour, ainsi que les 4 tests CRM et le test HTTP complet. Les audits npm du site et du CRM du 6 novembre 2026 ne signalent plus de vulnérabilité. Le parcours navigateur a été testé avec des coordonnées fictives uniquement.
