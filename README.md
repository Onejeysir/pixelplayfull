# PIXEL PLAY — site e-commerce gaming & high-tech

Boutique en ligne de **PIXEL PLAY** (Bonamoussadi, face Petit Terrain, Douala) : jeux vidéo PS4/PS5, consoles PlayStation, achat et vente d'appareils électroniques. La commande se fait **par WhatsApp** (+237 697 69 25 98) avec un message prérempli adapté à chaque produit.

> **Les produits, prix et stocks fournis sont des données de démonstration.** Un bandeau l'indique sur le site tant que vous ne l'avez pas désactivé (voir « Passer en production »).

## Démarrage

```bash
npm install
npm run dev          # développement : http://localhost:5173
npm run build        # vérification des types + build de production dans dist/
npm run preview      # sert dist/ en local : http://localhost:4173
npm test             # 97 tests unitaires et de composants
```

Prérequis : Node 18+ (testé avec Node 22). Pour les tests navigateur (facultatifs) : Python 3, `pip install playwright pillow`, puis `npx playwright install chromium`.

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil : héros, **trois axes**, populaires, nouveautés, dernières consoles, catégories, comment vendre, présentation, FAQ, contact |
| `/jeux` · `/jeux/numeriques` · `/jeux/physiques` | Catalogue des jeux (onglets, recherche, filtres plateforme / état / prix / disponibilité, tri) |
| `/consoles` | PS5 puis PS4, filtres génération / variante / état / budget |
| `/appareils` | Choix « Vendre mon appareil » ou « Acheter un appareil disponible » + catalogue d'appareils |
| `/vendre-mon-appareil` | Formulaire dynamique (ordinateur, téléphone, console), photos avec aperçu, récapitulatif, WhatsApp |
| `/produit/:id` | Fiche produit |
| `/contact` · `/recherche?q=` · `/confidentialite` | Contact et localisation, recherche globale, confidentialité |

Les filtres sont dans l'URL (`/consoles?gen=PS5&etat=occasion`) : le bouton Retour retrouve les filtres et la position de défilement.

## Structure

```
src/
  config/site.ts        ← numéro, adresse, limites de photos, bandeau démo (le seul fichier à toucher pour le contact)
  data/products.ts      ← catalogue (consoles, jeux, appareils) — à remplacer
  data/sellFormSpec.ts  ← champs du formulaire de vente par catégorie (source unique : affichage, validation, message)
  data/faq.ts
  lib/whatsapp.ts       ← construction des messages et URL wa.me (encodeURIComponent)
  lib/validation.ts · phone.ts · files.ts · catalog.ts · format.ts
  components/ · pages/ · hooks/ · styles/ (global.css, components.css, pages.css)
  assets/logoPath.ts    ← tracé vectoriel du logo (généré)
public/                 ← favicon, icônes, .htaccess, _redirects, images/produits/
design/                 ← logo source fourni
e2e/                    ← tests navigateur (Playwright, Python)
scripts/                ← génération du logo vectoriel et des icônes
```

## Configuration

- **Contact et commerce** : `src/config/site.ts` (numéro `tel` / `whatsappDigits`, adresse, devise, formats de photo acceptés).
- **Variables d'environnement** (copiez `.env.example` en `.env`) :

| Variable | Rôle | Défaut |
|---|---|---|
| `VITE_SITE_URL` | URL publique, pour le lien canonique | vide |
| `VITE_SHOW_DEMO_NOTICE` | bandeau « données de démonstration » | `true` |
| `VITE_MAX_PHOTOS` | photos maximum dans le formulaire | `6` |
| `VITE_MAX_PHOTO_MB` | taille maximum par photo (Mo) | `5` |

Aucune clé secrète n'existe ni ne doit être ajoutée : tout le code est public côté navigateur.

## Passer en production

1. **Catalogue** — remplacez le contenu de `src/data/products.ts`. Un objet = un produit, avec un `id` unique et stable (il apparaît dans l'URL et dans le message WhatsApp). Champs facultatifs à ne renseigner que s'ils sont vrais : `accessories`, `warranty`, `storage`. Une variante de console n'apparaît que si elle est dans ce fichier.
2. **Photos** — déposez-les dans `public/images/produits/` (format WebP conseillé, ~640×480, < 100 Ko) et renseignez `image: '/images/produits/ps5-standard.webp'`. Sans photo, une illustration provisoire s'affiche ; une photo introuvable retombe proprement sur cette illustration.
3. **Bandeau démo** — mettez `VITE_SHOW_DEMO_NOTICE=false` dans `.env`, puis `npm run build`.
4. **Disponibilité** — `in_stock` (En stock), `on_request` (Sur commande), `out_of_stock` (Épuisé : le bouton devient « Être prévenu sur WhatsApp »).
5. **À valider par PIXEL PLAY** avant publication : la page `/confidentialite` (version de travail), les **conditions des comptes de jeux** (leur vente doit respecter les conditions de la plateforme concernée — supprimez ces fiches si elle n'est pas autorisée), les **horaires** (aucun horaire n'est affiché, à ajouter dans `ContactPage.tsx` quand confirmés), et la position exacte sur la carte (le site utilise un lien de recherche sur l'adresse, sans coordonnées GPS inventées).

## Déploiement

`npm run build` produit `dist/`, un site statique. Les URL directes et l'actualisation fonctionnent grâce aux fichiers de redirection déjà inclus :

- **Hébergement cPanel / Apache** : envoyez le contenu de `dist/` à la racine (le `.htaccess` est inclus — pensez aux fichiers cachés).
- **Netlify / Cloudflare Pages** : `_redirects` inclus. **Vercel** : `vercel.json` inclus.

## WhatsApp : ce qui est réel et ce qui ne l'est pas

- Chaque bouton ouvre `https://wa.me/237697692598?text=…` avec un message construit **à partir des données du produit** (nom, variante, état, prix affiché, référence). Le texte est encodé par `encodeURIComponent`.
- **Les photos du formulaire ne sont PAS envoyées par le site.** Un lien WhatsApp ne peut pas joindre de fichiers : le message indique le nombre de photos et le site explique à l'utilisateur qu'il doit les joindre lui-même dans la conversation. Le site ne le présente jamais autrement.
- L'**IMEI n'est jamais saisi ni envoyé** : une case permet seulement d'indiquer qu'on pourra le fournir en message privé.
- Aucun paiement en ligne, aucune confirmation de transaction, aucun avis client ou chiffre de vente inventé.

## Limites d'une architecture 100 % frontend

Pas de base de données ni de gestion de commandes : WhatsApp sert de canal, pas de système de suivi. Les catalogues sont des fichiers à modifier puis à redéployer. Si vous voulez recevoir les photos directement depuis le site, de vraies commandes suivies ou un back-office, il faut un backend (stockage de fichiers sécurisé, validation côté serveur du type et de la taille, consentement, politique de conservation).

## Logo

Le symbole fourni (`design/PIXEL_PLAY_LOGO_.jpeg`) est **vectorisé par tracé fidèle**, sans redessin : superposition de contrôle à 99,6 % de recouvrement avec l'original. Il est affiché en violet sur fond clair, en blanc sur fond sombre, et décliné en favicon et icônes. Régénération : `npm run logo`.

## Tests réalisés (build du 28/10/2026)

| Contrôle | Résultat |
|---|---|
| `npm test` — messages WhatsApp, validation, téléphone, photos, filtres, tri, URL, images manquantes, filtres consoles | 97 / 97 |
| `tsc --noEmit` | 0 erreur |
| Parcours navigateur (Chromium) : 3 axes, filtres, 28 boutons de commande, fiche produit, Retour, menu mobile, clavier, bouton flottant, `tel:`, formulaire complet (champs dynamiques, erreurs, photos, récapitulatif, message) | 124 / 124 |
| Débordement horizontal — 9 largeurs (320 à 1440 px) × 17 routes, états du formulaire inclus ; aucune erreur console | 153 / 153 |
| Accessibilité automatisée axe-core (WCAG 2.1 A/AA + bonnes pratiques), 14 pages × 2 largeurs | 0 violation |
| Contrastes calculés sur les paires de la charte | conformes (le vert WhatsApp porte du texte sombre : 9,1:1) |

Relancer les tests navigateur : `npm run build && npm run preview`, puis dans un autre terminal `npm run e2e:fixtures && npm run e2e:fonctionnel && npm run e2e:responsive && npm run e2e:a11y`.

**Non vérifié** (à faire avant la mise en ligne) :
- l'ouverture réelle de WhatsApp sur de vrais téléphones et sur WhatsApp Web : le test confirme l'URL exacte et l'ouverture dans un nouvel onglet, mais `wa.me` n'était pas joignable depuis l'environnement de test ;
- Safari, Firefox et appareils réels (tests faits dans Chromium uniquement) ;
- la vitesse réelle sur connexion mobile lente (aucune mesure Lighthouse) : le JavaScript principal pèse 78 Ko compressé, le formulaire se charge à la demande, les images sont chargées en différé ;
- le visuel du héros utilise le logo et des illustrations : aucune photo de produit n'a été fournie.

## Licences

Polices Barlow Condensed et Inter (SIL OFL), servies depuis le site (aucune requête vers un service tiers). Le glyphe WhatsApp provient de Simple Icons (CC0) ; WhatsApp est une marque de WhatsApp LLC, utilisée ici uniquement pour désigner le canal de contact.
#   p i x e l p l a y f u l l  
 