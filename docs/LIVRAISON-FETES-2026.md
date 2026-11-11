# Livraison préparée — menus des fêtes et Escale Pro

État au 7 novembre 2026 : version en validation. Base D1 de production créée et migrations 0001 à 0004 appliquées. Commandes publiques fermées ; site et CRM non publiés dans cette version.

## Ce qui est développé

- Page festive approuvée intégrée au site : `/menu-fetes/`, panier, coordonnées obligatoires nom/prénom/téléphone, e-mail obligatoire, précisions, retrait et paiement. Prix serveur : 10 €, 9 €, 14 €, 15 €, 5,50 €, 5,50 €. La lotte est confirmée à 15 € par portion.
- Invitation intégrée à la photo d’accueil dès activation de la campagne, activable sans afficher la campagne avant validation.
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

1. Lotte confirmée à 15 € ; informations d’allergènes et ingrédients à valider.
2. Clôtures confirmées : 21 et 28 décembre 2026 à 23 h 59, Europe/Paris (UTC+1). Configuration de production préparée ; commandes publiques toujours fermées.
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
- Activer `HOLIDAY_CAMPAIGN_VISIBLE=true` pour afficher la page ; activer ensuite `HOLIDAY_ORDERS_OPEN=true` au moment convenu. Le bandeau suit la visibilité de la campagne ; les décors restent limités au 1er décembre–5 janvier.
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

## E-mail client
Adresse obligatoire pour suivi de commande et envoi de facture après paiement/retrait. Aucun fichier de prospection, aucune campagne et aucun choix mailing ne sont créés.

## Préparation du 14 novembre — état du 7 novembre
- Lotte à 15 € et coppa confirmées. E-mail requis côté site, serveur et saisie CRM.
- Clôtures : 21/12 et 28/12 à 23 h 59 Europe/Paris, dans le modèle de configuration de production. Aucune ouverture automatique activée.
- Réponses de Benjamin retrouvées dans Cloudflare (envoi du 05/11 à 20:01 UTC). Il a fourni une liste d’ingrédients ; elle mentionne encore du maigre, remplacé depuis par la lotte. La liste d’allergènes des préparations composées reste à faire valider.
- Facturation : coordonnées reprises de l’ancien modèle CRM, SIRET 93942640900016. Le modèle PDF préparé reprend la franchise de TVA ; activer ce mode seulement après validation finale du statut.

### E-mails transactionnels — non activés
Migration 0004 ajoute une file atomique : alerte de commande web et facture PDF à la validation du paiement/retrait. Le Worker séparé workers/holiday-mail.js traite la file toutes les cinq minutes et reprend les erreurs, même si Benjamin ferme le CRM. Clé d’idempotence par événement et statut d’envoi dans la commande. Une correction avant l’envoi annule la facture en attente ; un e-mail déjà envoyé ne peut pas être rappelé. Une facture déjà envoyée n’est pas renvoyée automatiquement après correction/revalidation.

Resend est la solution préparée, sans compte ni envoi activés : offre gratuite annoncée 3 000 e-mails/mois et 100/jour. Cette intégration limite ses tentatives à 90/jour. Respecter le forfait gratuit et ne pas activer de facturation automatique. Sources : https://resend.com/pricing et https://resend.com/docs/dashboard/emails/idempotency-keys.

Avant activation : vérifier un domaine expéditeur, enregistrer RESEND_API_KEY uniquement comme secret du Worker e-mail, fournir HOLIDAY_MAIL_FROM, conserver jardinbenjamin@hotmail.fr comme destinataire d’alerte, compléter la confidentialité avec le prestataire réellement utilisé, tester l’envoi vers une adresse de test, puis passer HOLIDAY_MAIL_ENABLED=true. Le modèle wrangler.mail-production.example.jsonc reste désactivé et utilise un identifiant de base fictif. Appliquer 0004 avant la nouvelle version de l’API.

Sauvegarde avant remplacement : les anciens devis et factures sont sur l’appareil de Benjamin ; une sauvegarde de code seule ne les sauvegarde pas. Obtenir et vérifier son export depuis cet appareil avant le lancement. Aucune donnée existante n’a été effacée ni migrée.

## Avancement du 7 novembre — raccordement réel
- Base de production `escale-commandes-fetes` : migrations vérifiées, aucune migration restante.
- Domaine `notifications.uneescalegourmande.fr` : TXT DKIM et deux CNAME ajoutés, DNS uniquement. Vérification Resend en cours ; réception désactivée. MX et SPF de la messagerie existante inchangés.
- Expéditeur préparé : Une Escale Gourmande <commandes@notifications.uneescalegourmande.fr>. Alertes et réponses : jardinbenjamin@hotmail.fr.
- Service e-mail séparé, sans endpoint public, déployable indépendamment par workflow manuel `target=mail`. Configuration encore désactivée. Aucune clé Resend dans le dépôt.
- Page des fêtes : marque seule, livraison sur demande avec contact préalable, clôtures à 23 h 59.
- PDF : coordonnées longues réparties sur plusieurs lignes et changement de page si nécessaire.
- Tests : 69 site et 7 CRM réussis ; compilation du site réussie.
- Restent nécessaires avant ouverture : domaine Resend entièrement validé, clé d’envoi serveur, test réel des e-mails, sauvegarde du navigateur de Benjamin, confirmation TVA et allergènes, recette sur accès réel.

### Raccordement terminé le 7 novembre au soir
- Domaine Resend vérifié. Clé créée avec permission Sending access limitée à notifications.uneescalegourmande.fr ; stockée uniquement comme secret chiffré RESEND_API_KEY du Worker Cloudflare escale-commandes-mail. Aucun secret dans GitHub ou le code.
- Service e-mail déployé avec succès par GitHub Actions (run 42413751776) depuis la branche de préparation. Le job de publication du site a été ignoré. Envoi toujours désactivé, aucun e-mail de test ou client envoyé.
- Paramètres d’expédition, destinataire marchand, adresse de réponse, liaison D1 et déclencheur toutes les cinq minutes vérifiés dans Cloudflare.
- 70 tests site, 7 tests CRM, compilations site et CRM et scénario HTTP local réussis. Rendu PDF avec coordonnées très longues et six plats vérifié sur deux pages.
- Branches de préparation sauvegardées sur GitHub ; aucune fusion sur master, aucun remplacement du site ou du CRM publics.
- Confidentialité mise à jour pour identifier Resend comme prestataire transactionnel.
- Questions envoyées à Melvin : confirmation de la franchise TVA actuelle et validation des allergènes / produits composés par Benjamin.
- Encore à faire : réception réelle d’un e-mail de test, accès serveur CRM de production, export des données locales depuis l’appareil de Benjamin et recette réelle avant ouverture du 14 novembre.

## Confirmation du 8 novembre 2026
Melvin confirme le régime sans TVA déjà appliqué dans le CRM. HOLIDAY_VAT_MODE=exempt_293b est configuré dans les fichiers de production ; ce point n’est plus en attente. Commandes toujours fermées. Les ingrédients du questionnaire ont été repris dans docs/ALLERGENES-FETES-2026.md : seules les compositions fournisseurs et substitutions nécessitent une vérification ciblée.

## Consigne du 8 novembre — allergènes
Utiliser uniquement les éléments expressément fournis par Benjamin, sans déduction, allergène supplémentaire ou mention de traces. Le tableau déduit a été remplacé par sa réponse originale dans docs/ALLERGENES-FETES-2026.md. Cette consigne remplace les demandes de vérification complémentaire figurant dans les états historiques ci-dessus.

## Recette e-mail du 8 novembre 2026
Envoi autorisé par Melvin à passe.melvin@gmail.com. Événement technique isolé test:mail-validation-20261108, sans création de commande ni consommation d’un numéro de facture.
- Reçu dans la boîte Gmail le 8 novembre à 9 h 35 (Paris), sujet TEST · Facture fictive · Une Escale Gourmande.
- Pièce jointe PDF présente, 5 488 octets, marquée TEST — SANS VALEUR COMPTABLE.
- Expéditeur : commandes@notifications.uneescalegourmande.fr ; réponse : jardinbenjamin@hotmail.fr.
- File serveur : envoyé, une seule tentative. Base vérifiée : 0 commande, 0 facture, 1 test envoyé.
- Mode test isolé activé par le run 42463224089, puis redéploiement normal de désactivation lancé via le run 42463657440. Les envois clients restent désactivés.
- Migration 0005 ajoute le champ technique test_payload à la file ; aucun endpoint public de test.
- Configuration principale du site raccordée à la D1 de production, campagne et commandes toujours fermées. Contrôle automatique scripts/check-holiday-release.mjs ajouté avant publication.
- Ancien formulaire /commande-fetes/ remplacé par une redirection vers le parcours unique /menu-fetes/. Ingrédients fournis par Benjamin consultables sous chaque plat, sans allergènes ou traces déduits.
- Connexion réelle : secret HOLIDAY_ADMIN_KEY absent du Worker du site ; formulaire Cloudflare préparé et saisie de la nouvelle phrase secrète confiée à Melvin. Aucun secret saisi par l’agent.

### Accès CRM configuré le 8 novembre
Melvin a saisi lui-même la phrase secrète dans Cloudflare. Présence de HOLIDAY_ADMIN_KEY vérifiée comme secret chiffré sur le Worker une-escale-gourmande ; valeur non lue et non enregistrée. La connexion devra être testée par Melvin avec cette phrase lors de la recette de la nouvelle version. Le site et le CRM de préparation ne sont pas encore publiés.

## Connexion corrigée — PIN habituel, 8 novembre
À la demande de Melvin, l’accès par HOLIDAY_ADMIN_KEY est retiré. Le CRM de préparation utilise à nouveau PinScreen et le PIN local existant, sans modification des clés ep_pin_v2, ep_recovery_v2 ou ep_setup. Le changement de PIN et la déconnexion habituels sont rétablis.
Les commandes restent protégées par une association d’appareil : lien privé à usage unique, puis clé privée non exportable conservée en IndexedDB et preuve signée sur challenge éphémère. Le PIN ne quitte pas l’appareil. Aucun second mot de passe à retenir. Un téléphone non associé conserve l’accès à ses documents locaux mais ne peut pas consulter les commandes partagées.
Migration 0006 préparée et appliquée. Les anciennes sessions serveur ont été révoquées. Le script propriétaire scripts/create-crm-pairing.mjs --production génère, au moment de l’association, un lien privé valide 24 h. Ne pas créer ce lien plusieurs jours avant l’installation. Ne pas le publier dans Git, dans un QR public ou dans le kit communication.
Recette locale réussie : association à usage unique, preuve signée valide, rejet du second emploi du lien et de la preuve, accès anonyme refusé, puis commande / facture / correction / révocation. 72 tests site et 7 tests CRM passent. Les compilations passent.
Le jeton GitHub actuel ne peut pas interroger D1 : les migrations sont donc appliquées avec l’accès D1 existant de Melvin avant publication, sans élargir les permissions. Le retrait de secret utilise uniquement l’accès de déploiement GitHub existant.
Cette correction reste sur les branches de préparation ; l’ancienne connexion du CRM public n’a pas été remplacée.

Retrait du secret vérifié avec succès par le run GitHub 42465489169. HOLIDAY_ADMIN_KEY absent du Worker, anciennes sessions révoquées via l’accès D1 existant. Aucun PIN utilisateur lu, changé ou envoyé au serveur. Correction CRM sauvegardée sur codex/fetes-orders. Association du téléphone encore à réaliser au déploiement de la nouvelle version.

## Mise à jour publiée le 8 novembre — GO de Melvin
Site : source master 4cee131, déploiement 42469087417 réussi. CRM : source master b008597, déploiement GitHub Pages 42469078284 réussi. Même adresse https://sarthe72.github.io/escale-pro/, aucun service worker à réinstaller.
- PIN habituel conservé. Les clés de documents locales et leur contenu ne sont pas migrés ni effacés. Copie préalable des documents existants en IndexedDB au premier démarrage, sans PIN/session ; téléchargement disponible dans Sauvegarde de mes documents. Ce n’est pas une sauvegarde externe et sa réussite sur le téléphone reste à vérifier sur cet appareil. Le démarrage n’attend pas plus de 1,5 seconde une éventuelle indisponibilité du stockage de copie.
- Catalogue en ligne : lotte 15 €, commandes fermées, campagne masquée. Page menu-fetes retourne 404 ; commandes/factures anonymes retournent 401 ; ancienne clé refusée.
- Test de connexion de production réussi via scripts/test-crm-production.mjs --production : lien unique, preuve signée, rejet du rejeu, accès aux routes protégées, révocation de session. Appareil technique révoqué en fin de test ; aucune commande/facture créée.
- Lien privé à usage unique créé séparément pour le téléphone de Benjamin, valable 24 heures. Ne pas enregistrer sa valeur dans ce dossier. L’ouverture doit se faire sur son téléphone dans le navigateur habituel du CRM, puis avec son PIN habituel. Association réelle du téléphone encore attendue.
- Les e-mails clients restent désactivés jusqu’à activation de la vente ; test réel de facture déjà reçu le 8 novembre.

## Programmation confirmée par Melvin le 9 novembre
- Menus, navigation, bandeau et prise de commandes : 13 novembre 2026 à 23 h 59 Europe/Paris (2026-11-13T22:59:00Z).
- E-mails transactionnels : autorisés à partir de ce même instant, traités par la file toutes les cinq minutes.
- Activation implémentée dans le serveur et dans le Worker e-mail via HOLIDAY_LAUNCH_AT : aucun déploiement ou ordinateur local requis au moment du lancement. Un flag false reste un interrupteur de fermeture ; une date invalide bloque l’ouverture.
- Décors saisonniers : 1er décembre à 00 h 01 Europe/Paris, jusqu’au 5 janvier inclus. Calendrier annuel conservé. Le pré-affichage du layout et les composants suivent la même minute.
- Les pages déjà ouvertes actualisent le catalogue et les éléments saisonniers à la prochaine frontière de minute, et lors du retour sur l’onglet. Le 404 de la page cachée est non stockable pour ne pas persister après l’ouverture.
- 81 tests passent, incluant les millisecondes précédant le lancement, les commandes directes au serveur et le refus d’envoi des e-mails avant la date ; tests des décors à 00 h 00, 00 h 00 min 59 s et 00 h 01 sur 2026, 2027, 2028.

### Programmation publiée et contrôlée le 9 novembre
- Site publié avec succès : run 42625199783, commit d25360e (source de programmation c1aa5df).
- Worker e-mail publié avec succès : run 42625054368, version 418d4f31-3362-4750-b870-495eb638fc45. Variables HOLIDAY_MAIL_ENABLED=true et HOLIDAY_LAUNCH_AT=2026-11-13T23:59:00+01:00 vérifiées dans les journaux de publication. Le calendrier bloque encore les envois.
- API réelle : opensAt correspond à l’horaire demandé, open=false et campaignVisible=false. Page menu encore 404 avec Cache-Control:no-store ; tentative de commande refusée avec le message d’ouverture non effective. Aucun document créé par ce contrôle.
- 81 tests et compilation réussis. Les tâches de publication du site et des e-mails ont désormais des groupes distincts pour éviter qu’elles s’annulent mutuellement.
- Téléphone : aucun appareil réel associé au moment de la vérification ; l’association reste à réaliser avant exploitation des commandes dans le CRM.

## Factures e-mail corrigées le 11 novembre
Melvin signale que la pièce jointe du test du 8 novembre ne respecte pas le modèle existant. Le mail et sa pièce jointe ont été lus dans Gmail : le PDF utilisait le générateur simplifié holidayInvoicePdf.
Ce générateur est remplacé par un adaptateur vers une copie fidèle du générateur genFacturePDF du CRM publié. Aucun fichier du CRM n’est modifié. La mise en page, le filigrane, les couleurs, le tableau, le pied de page et les informations bancaires sont conservés. Seuls le chemin d’import des constantes et le format de sortie technique (document au lieu de Blob) sont adaptés pour le serveur. Le statut acquitté est fourni après la vérification paiement/retrait du Worker.
Provenance et empreintes des fichiers : docs/FACTURE-MODELE-CRM.json. Un test compare l’empreinte du générateur restauré à la source CRM. Deux PDF fictifs à six plats ont été générés : le PDF du modèle original et celui du chemin d’envoi e-mail ont un rendu strictement identique pixel par pixel, vérifié après rendu Poppler.
82 tests réussis, compilation Worker réussie. La programmation d’ouverture et les paramètres d’envoi ne sont pas modifiés. Aucun nouvel e-mail n’est envoyé pour cette correction.
