export async function GET({ request }) {
  const origin = new URL(request.url).origin;

  const yaml = `
backend:
  name: github
  repo: passemelvin/une-escale-gourmande
  branch: master
  base_url: https://une-escale-gourmande.passe-melvin.workers.dev

locale: fr
media_folder: public/images
public_folder: /images

collections:
  - name: chambre
    label: "Chambre d'hote"
    files:
      - label: Tarifs
        name: tarifs
        file: src/data/tarifs-chambre.json
        fields:
          - label: "Prix de base (2 pers. + petit-dejeuner) en euros"
            name: prix_base
            widget: number
          - label: "Prix haute saison (juillet et aout) en euros"
            name: prix_haute_saison
            widget: number
          - label: "Diner en option (par personne) en euros"
            name: prix_diner
            widget: number
      - label: "Photos de la chambre"
        name: photos_chambre
        file: src/data/photos-chambre.json
        fields:
          - label: Photos
            name: photos
            widget: list
            fields:
              - {label: Photo, name: src, widget: image}
              - {label: Description, name: alt, widget: string}
      - label: "Photos du domaine"
        name: photos_domaine
        file: src/data/photos-domaine.json
        fields:
          - label: Photos
            name: photos
            widget: list
            fields:
              - {label: Photo, name: src, widget: image}
              - {label: Description, name: alt, widget: string}
  - name: truffe
    label: "Menu Truffe"
    files:
      - label: "Photos du menu truffe"
        name: photos_truffe
        file: src/data/photos-truffe.json
        fields:
          - label: Photos
            name: photos
            widget: list
            fields:
              - {label: Photo, name: src, widget: image}
              - {label: Description, name: alt, widget: string}
`.trim();

  return new Response(yaml, {
    headers: { 'Content-Type': 'text/yaml; charset=utf-8' }
  });
}
