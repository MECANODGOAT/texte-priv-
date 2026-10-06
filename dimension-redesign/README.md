# Dimension — maquette de refonte du front-end

Proposition de nouveau visuel pour [dimensionbte.com](https://dimensionbte.com), à présenter au
propriétaire. Le site actuel (WordPress + Elementor + WooCommerce) n'est pas modifié : cette
maquette lit son catalogue public et renvoie vers ses fiches produits pour finaliser la commande.

## Ce qui change

- **Visionneuse 360°** sur chaque fiche produit et en page d'accueil : glisser pour tourner (avec
  inertie), boutons Face / Dos, flèches du clavier, pause de la rotation automatique. Les vêtements
  sont détourés automatiquement et empilés en couches pour donner de l'épaisseur au profil.
  Les pièces sans photo de dos ont un mode « 3D » (balancement) au lieu du tour complet.
- **Animations** : titre du hero révélé ligne par ligne, cartes qui se retournent au survol pour
  montrer le dos, filtres avec transition, apparitions au défilement, bandeaux défilants,
  lookbook en carrousel 3D, transition animée entre les pages. Tout respecte le réglage système « réduire les animations ».
- **Composants 21st.dev** (adaptés au style Dimension, sans Tailwind) :
  - *Coverflow Carousel* (@educalvolpz) — galerie photo en carrousel 3D pour le lookbook de
    l'accueil et les photos portées des fiches produits : glisser, flèches du clavier, clic sur
    une photo latérale, défilement automatique en pause hors écran ou au survol.
  - *Page Transition* (@su2491251), effet « double-stairs » — rideau en colonnes noires et
    rouge avec le logo entre chaque page, déclenché automatiquement sur tous les liens internes.
- **Corrections relevées sur le site actuel** : promesse de livraison cohérente partout (gratuite dès
  500 DH, 24h Casablanca, 48–72h ailleurs), plus de mélange français/anglais, pas de pop-up
  WhatsApp à l'arrivée, un seul vrai titre H1, textes alternatifs sur les images, description
  produit repliable, guide des tailles en fenêtre.

## Lancer la maquette

```bash
npm install
npm run dev        # http://localhost:3000
```

Pages : `/` (accueil), `/produit/<slug>` (fiche produit + 360°), `/collection/<slug>`.

## Mettre à jour le catalogue

```bash
npm run sync
```

Le script `scripts/sync-products.mjs` interroge l'API publique WooCommerce
(`/wp-json/wc/store/v1/products`), trie les photos (face, dos, guide des tailles, photos portées)
d'après leur fond gris de studio, détoure les packshots (`scripts/cutout.mjs`) dans
`public/cutouts/` et écrit `src/data/catalog.json`. Deux tableaux en tête du script permettent de
corriger le tri à la main : `BACK_OVERRIDES` (ensembles sans vraie vue de dos) et
`SWAP_FRONT_BACK` (photo principale qui est en fait le dos).

## Pour un vrai 360° (étape suivante)

La maquette tourne avec deux photos (face + dos). Pour un rendu 360° photo-réaliste, il suffit de
shooter chaque pièce sur un plateau tournant (24 à 36 photos, fond gris uni identique aux
packshots actuels) : la visionneuse peut alors faire défiler ces images au lieu de deux faces.

## Limites de la maquette

- Le panier, la recherche et les favoris sont visuels ; « Commander » ouvre la fiche produit sur
  dimensionbte.com.
- Le formulaire newsletter n'est relié à aucun service.
- Les pages ne sont pas indexées (`robots: noindex`).
