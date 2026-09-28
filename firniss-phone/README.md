# firniss.phone

Boutique en ligne d'iPhone (du 11 au 18 Pro Max) pour le Maroc et le Gabon.

- **Site** : catalogue 3D, choix du pays (prix en dirhams ou en francs CFA), panier, commande.
- **Paiement manuel** : le client choisit Wafacash, Banque Populaire, CIH, Airtel Money, Moov Money ou Wave, reçoit les instructions, puis envoie sa preuve de paiement par WhatsApp.
- **Espace admin** (`/admin`) : suivi des commandes, prix, stock, photos par couleur, instructions de paiement.

Technos : Next.js 16, Supabase (base de données, connexion admin, photos), hébergement Vercel.

## Lancer le site sur son ordinateur

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

Sans Supabase configuré, le site s'affiche avec le catalogue d'exemple, mais les commandes ne sont pas enregistrées.

## Mettre en place la base de données (une seule fois)

1. Créez un projet gratuit sur [supabase.com](https://supabase.com).
2. Créez votre compte admin : **Authentication > Users > Add user** (e-mail + mot de passe, cochez « Auto Confirm User »).
3. Ouvrez `supabase/setup.sql`, remplacez `VOTRE_EMAIL@exemple.com` (tout en bas) par l'e-mail du compte admin.
4. Collez tout le fichier dans **SQL Editor** et cliquez sur **Run**. Le fichier peut être relancé sans risque.
5. Dans **Project Settings > API**, copiez l'URL, la clé `anon` et la clé `service_role` dans `.env.local` (ou dans Vercel).
6. Connectez-vous sur `/admin`, puis, dans **Moyens de paiement**, remplacez les textes entre crochets par vos vrais numéros et RIB.

## Mettre le site en ligne

1. Importez le dépôt sur [vercel.com](https://vercel.com), avec `firniss-phone` comme dossier racine (Root Directory).
2. Ajoutez les mêmes variables que dans `.env.local` (Settings > Environment Variables).
3. Déployez.

## Comment une commande se déroule

1. Le client choisit ses téléphones et son pays, puis remplit le formulaire de commande.
2. Le serveur recalcule les prix (ceux du navigateur ne sont jamais utilisés), vérifie le stock et enregistre la commande.
3. Le client voit les instructions de paiement et un bouton pour envoyer sa preuve sur WhatsApp.
4. Vous recevez un e-mail si Resend est configuré. Sinon, la commande apparaît dans `/admin`.
5. Dans `/admin`, vous passez la commande en « Payée » (le stock baisse), puis « Expédiée » et « Livrée ».

## Où modifier quoi

| Quoi | Où |
| --- | --- |
| Prix, stock, photos, produits en vente | `/admin/produits` |
| Instructions de paiement | `/admin/paiements` |
| Taux euro → dirham | variable `NEXT_PUBLIC_EUR_TO_MAD` |
| Logos officiels des moyens de paiement | fichiers dans `public/paiements/`, chemins dans `src/components/PaymentLogos.tsx` |
| Couleurs et style du site | `src/app/globals.css` |
| Ajouter un nouveau modèle | une ligne dans la table `products` (Supabase > Table Editor) |

## À faire avant l'ouverture

- Remplacer les prix d'exemple et vérifier les couleurs de l'iPhone 18 (inventées).
- Ajouter de vraies photos (les vôtres ou celles de votre fournisseur : les photos Apple sont protégées).
- Remplacer les badges de paiement par les logos officiels fournis par chaque opérateur.
- Vérifier que chaque moyen de paiement est bien disponible dans le pays indiqué.
