import type {
  ConsoleProduct,
  DeviceProduct,
  DigitalGameProduct,
  PhysicalGameProduct,
  Product,
} from '../types/catalog'

/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  DONNÉES DE DÉMONSTRATION                                                │
 * │  Les produits, prix, stocks et accessoires ci-dessous sont des EXEMPLES │
 * │  destinés à montrer le fonctionnement du site. Ils ne reflètent pas le   │
 * │  stock réel de PIXEL PLAY.                                               │
 * │                                                                          │
 * │  Pour passer en production :                                             │
 * │   1. remplacez le contenu des quatre tableaux ci-dessous par le vrai     │
 * │      catalogue (un objet = un produit, `id` unique et stable) ;          │
 * │   2. déposez les photos dans public/images/produits/ et renseignez       │
 * │      `image: '/images/produits/mon-produit.webp'` ;                      │
 * │   3. mettez VITE_SHOW_DEMO_NOTICE=false dans le fichier .env.            │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

export const consoles: ConsoleProduct[] = [
  {
    id: 'console-ps5-standard-neuf',
    kind: 'console',
    name: 'PlayStation 5 Standard',
    generation: 'PS5',
    variant: 'Standard avec lecteur de disque',
    storage: '825 Go',
    condition: 'neuf',
    price: 445000,
    availability: 'in_stock',
    accessories: ['1 manette sans fil', 'Câble HDMI', 'Câble d’alimentation'],
    description: 'Console PS5 avec lecteur de disque : lit les jeux sur disque et les jeux numériques.',
    featured: true,
    addedAt: '2026-10-20',
  },
  {
    id: 'console-ps5-digital-neuf',
    kind: 'console',
    name: 'PlayStation 5 Digital Edition',
    generation: 'PS5',
    variant: 'Digital Edition (sans lecteur)',
    storage: '825 Go',
    condition: 'neuf',
    price: 395000,
    availability: 'in_stock',
    accessories: ['1 manette sans fil', 'Câble HDMI', 'Câble d’alimentation'],
    description: 'Console PS5 sans lecteur de disque : uniquement des jeux numériques.',
    addedAt: '2026-10-18',
  },
  {
    id: 'console-ps5-slim-neuf',
    kind: 'console',
    name: 'PlayStation 5 Slim',
    generation: 'PS5',
    variant: 'Slim avec lecteur de disque',
    storage: '1 To',
    condition: 'neuf',
    price: 475000,
    availability: 'on_request',
    description: 'Version Slim de la PS5, plus compacte, avec lecteur de disque.',
    addedAt: '2026-10-15',
  },
  {
    id: 'console-ps5-standard-occasion',
    kind: 'console',
    name: 'PlayStation 5 Standard',
    generation: 'PS5',
    variant: 'Standard avec lecteur de disque',
    storage: '825 Go',
    condition: 'occasion',
    price: 360000,
    availability: 'in_stock',
    accessories: ['1 manette sans fil', 'Câble HDMI', 'Câble d’alimentation'],
    description: 'PS5 d’occasion contrôlée avant mise en vente. L’état exact est précisé sur WhatsApp.',
    addedAt: '2026-10-12',
  },
  {
    id: 'console-ps4-pro-occasion',
    kind: 'console',
    name: 'PlayStation 4 Pro',
    generation: 'PS4',
    variant: 'Pro',
    storage: '1 To',
    condition: 'occasion',
    price: 165000,
    availability: 'in_stock',
    accessories: ['1 manette sans fil', 'Câble HDMI', 'Câble d’alimentation'],
    description: 'PS4 Pro d’occasion : sortie 4K et meilleures performances que la PS4 classique.',
    featured: true,
    addedAt: '2026-10-22',
  },
  {
    id: 'console-ps4-slim-occasion',
    kind: 'console',
    name: 'PlayStation 4 Slim',
    generation: 'PS4',
    variant: 'Slim',
    storage: '500 Go',
    condition: 'occasion',
    price: 115000,
    availability: 'in_stock',
    description: 'PS4 Slim d’occasion, compacte et économe en énergie.',
    addedAt: '2026-10-10',
  },
  {
    id: 'console-ps4-standard-occasion',
    kind: 'console',
    name: 'PlayStation 4 Standard',
    generation: 'PS4',
    variant: 'Standard',
    storage: '500 Go',
    condition: 'occasion',
    price: 85000,
    availability: 'out_of_stock',
    description: 'PS4 d’entrée de gamme, d’occasion. Actuellement épuisée.',
    addedAt: '2026-09-28',
  },
]

export const physicalGames: PhysicalGameProduct[] = [
  {
    id: 'jeu-ea-fc-26-ps5-neuf',
    kind: 'game-physical',
    name: 'EA SPORTS FC 26',
    platform: 'PS5',
    condition: 'neuf',
    price: 38000,
    availability: 'in_stock',
    description: 'Jeu de football sur disque pour PS5.',
    featured: true,
    addedAt: '2026-10-21',
  },
  {
    id: 'jeu-ea-fc-26-ps4-neuf',
    kind: 'game-physical',
    name: 'EA SPORTS FC 26',
    platform: 'PS4',
    condition: 'neuf',
    price: 32000,
    availability: 'in_stock',
    description: 'Jeu de football sur disque pour PS4.',
    addedAt: '2026-10-21',
  },
  {
    id: 'jeu-spider-man-2-ps5-occasion',
    kind: 'game-physical',
    name: 'Marvel’s Spider-Man 2',
    platform: 'PS5',
    condition: 'occasion',
    price: 24000,
    availability: 'in_stock',
    description: 'Jeu d’action-aventure sur disque pour PS5, disque d’occasion testé.',
    featured: true,
    addedAt: '2026-10-19',
  },
  {
    id: 'jeu-god-of-war-ragnarok-ps5-occasion',
    kind: 'game-physical',
    name: 'God of War Ragnarök',
    platform: 'PS5',
    condition: 'occasion',
    price: 20000,
    availability: 'in_stock',
    description: 'Jeu d’action-aventure sur disque pour PS5, disque d’occasion testé.',
    addedAt: '2026-10-14',
  },
  {
    id: 'jeu-gta-v-ps4-occasion',
    kind: 'game-physical',
    name: 'Grand Theft Auto V',
    platform: 'PS4',
    condition: 'occasion',
    price: 9000,
    availability: 'in_stock',
    description: 'Jeu d’action en monde ouvert sur disque pour PS4, disque d’occasion testé.',
    featured: true,
    addedAt: '2026-10-08',
  },
  {
    id: 'jeu-the-last-of-us-2-ps4-occasion',
    kind: 'game-physical',
    name: 'The Last of Us Part II',
    platform: 'PS4',
    condition: 'occasion',
    price: 10000,
    availability: 'on_request',
    description: 'Jeu d’action-aventure sur disque pour PS4.',
    addedAt: '2026-10-02',
  },
  {
    id: 'jeu-mortal-kombat-1-ps5-neuf',
    kind: 'game-physical',
    name: 'Mortal Kombat 1',
    platform: 'PS5',
    condition: 'neuf',
    price: 29000,
    availability: 'out_of_stock',
    description: 'Jeu de combat sur disque pour PS5. Actuellement épuisé.',
    addedAt: '2026-09-25',
  },
  {
    id: 'jeu-gran-turismo-7-ps4-occasion',
    kind: 'game-physical',
    name: 'Gran Turismo 7',
    platform: 'PS4',
    condition: 'occasion',
    price: 11000,
    availability: 'in_stock',
    description: 'Jeu de course sur disque pour PS4, disque d’occasion testé.',
    addedAt: '2026-09-30',
  },
]

const CODE_CONDITIONS = [
  'Produit numérique : aucun disque ni boîte n’est livré.',
  'Le code est à activer sur votre propre compte PlayStation ; la région du code est confirmée avant paiement.',
  'PIXEL PLAY ne vous demandera jamais votre mot de passe ni un code de vérification.',
]

const ACCOUNT_CONDITIONS = [
  'Produit numérique de type compte de jeux : ce n’est pas un produit physique.',
  'La vente de comptes est soumise aux conditions de la plateforme concernée : restrictions d’usage, modalités d’accès et conditions de transfert autorisées sont précisées par PIXEL PLAY avant tout paiement.',
  'Ne communiquez jamais les identifiants de votre propre compte, ni mot de passe, ni code de vérification.',
]

export const digitalGames: DigitalGameProduct[] = [
  {
    id: 'num-ea-fc-26-ps5-code',
    kind: 'game-digital',
    name: 'EA SPORTS FC 26',
    platform: 'PS5',
    digitalType: 'code',
    price: 34000,
    availability: 'in_stock',
    description: 'Version numérique du jeu de football pour PS5, fournie sous forme de code à activer.',
    conditions: CODE_CONDITIONS,
    featured: true,
    addedAt: '2026-10-21',
  },
  {
    id: 'num-spider-man-2-ps5-code',
    kind: 'game-digital',
    name: 'Marvel’s Spider-Man 2',
    platform: 'PS5',
    digitalType: 'code',
    price: 28000,
    availability: 'on_request',
    description: 'Version numérique du jeu d’action-aventure pour PS5, fournie sous forme de code à activer.',
    conditions: CODE_CONDITIONS,
    addedAt: '2026-10-16',
  },
  {
    id: 'num-gran-turismo-7-ps4-code',
    kind: 'game-digital',
    name: 'Gran Turismo 7',
    platform: 'PS4',
    digitalType: 'code',
    price: 13000,
    availability: 'in_stock',
    description: 'Version numérique du jeu de course pour PS4, fournie sous forme de code à activer.',
    conditions: CODE_CONDITIONS,
    addedAt: '2026-10-05',
  },
  {
    id: 'num-compte-ps5-pack-sport',
    kind: 'game-digital',
    name: 'Compte PS5 — pack jeux de sport (exemple)',
    platform: 'PS5',
    digitalType: 'compte',
    price: 45000,
    availability: 'on_request',
    description:
      'Exemple de fiche « compte de jeux » : le contenu exact du compte et les conditions d’accès sont détaillés sur WhatsApp avant tout paiement.',
    conditions: ACCOUNT_CONDITIONS,
    addedAt: '2026-10-01',
  },
]

export const devices: DeviceProduct[] = [
  {
    id: 'appareil-hp-probook-450-g7',
    kind: 'device',
    deviceType: 'ordinateur',
    name: 'HP ProBook 450 G7',
    brand: 'HP',
    model: 'ProBook 450 G7',
    condition: 'occasion',
    price: 245000,
    availability: 'in_stock',
    description: 'Ordinateur portable d’occasion pour le travail et les études.',
    specs: [
      { label: 'Processeur', value: 'Intel Core i5 (10e génération)' },
      { label: 'Mémoire RAM', value: '8 Go' },
      { label: 'Stockage', value: '256 Go SSD' },
      { label: 'Écran', value: '15,6 pouces' },
    ],
    accessories: ['Chargeur'],
    addedAt: '2026-10-23',
  },
  {
    id: 'appareil-dell-latitude-5490',
    kind: 'device',
    deviceType: 'ordinateur',
    name: 'Dell Latitude 5490',
    brand: 'Dell',
    model: 'Latitude 5490',
    condition: 'occasion',
    price: 195000,
    availability: 'in_stock',
    description: 'Ordinateur portable d’occasion, format 14 pouces facile à transporter.',
    specs: [
      { label: 'Processeur', value: 'Intel Core i5 (8e génération)' },
      { label: 'Mémoire RAM', value: '8 Go' },
      { label: 'Stockage', value: '256 Go SSD' },
      { label: 'Écran', value: '14 pouces' },
    ],
    accessories: ['Chargeur'],
    addedAt: '2026-10-17',
  },
  {
    id: 'appareil-samsung-galaxy-a54',
    kind: 'device',
    deviceType: 'telephone',
    name: 'Samsung Galaxy A54',
    brand: 'Samsung',
    model: 'Galaxy A54',
    condition: 'occasion',
    price: 165000,
    availability: 'in_stock',
    description: 'Smartphone d’occasion en bon état général.',
    specs: [
      { label: 'Stockage', value: '128 Go' },
      { label: 'Mémoire RAM', value: '6 Go' },
      { label: 'Écran', value: '6,4 pouces' },
    ],
    accessories: ['Chargeur'],
    addedAt: '2026-10-24',
  },
  {
    id: 'appareil-iphone-11-64',
    kind: 'device',
    deviceType: 'telephone',
    name: 'iPhone 11',
    brand: 'Apple',
    model: 'iPhone 11',
    condition: 'occasion',
    price: 175000,
    availability: 'on_request',
    description: 'Smartphone d’occasion. L’état de la batterie est communiqué sur WhatsApp.',
    specs: [
      { label: 'Stockage', value: '64 Go' },
      { label: 'Écran', value: '6,1 pouces' },
    ],
    addedAt: '2026-10-09',
  },
  {
    id: 'appareil-xbox-series-s',
    kind: 'device',
    deviceType: 'console',
    name: 'Xbox Series S',
    brand: 'Microsoft',
    model: 'Xbox Series S',
    condition: 'occasion',
    price: 215000,
    availability: 'out_of_stock',
    description: 'Console d’occasion sans lecteur de disque. Actuellement épuisée.',
    specs: [
      { label: 'Stockage', value: '512 Go' },
      { label: 'Lecteur de disque', value: 'Non (version numérique)' },
    ],
    accessories: ['1 manette sans fil'],
    addedAt: '2026-09-27',
  },
]

export const allProducts: Product[] = [...consoles, ...physicalGames, ...digitalGames, ...devices]

export const allGames = [...physicalGames, ...digitalGames]

export function findProduct(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id)
}

/** Chemin de la fiche d'un produit. */
export function productPath(product: Product): string {
  return `/produit/${product.id}`
}
