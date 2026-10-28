export type Platform = 'PS4' | 'PS5'
export type Condition = 'neuf' | 'occasion'
export type Availability = 'in_stock' | 'on_request' | 'out_of_stock'
export type DeviceType = 'ordinateur' | 'telephone' | 'console'
export type DigitalType = 'code' | 'compte'

/** Champs communs à tous les produits du catalogue. */
interface BaseProduct {
  /** Identifiant stable : il apparaît dans l'URL (/produit/:id) et dans le message WhatsApp. */
  id: string
  name: string
  price: number
  availability: Availability
  description: string
  /** Chemin d'une image dans /public (ex. /images/produits/ps5-standard.webp). Optionnel. */
  image?: string
  /** Texte alternatif de l'image. Par défaut : le nom du produit. */
  imageAlt?: string
  /** Mis en avant sur la page d'accueil. */
  featured?: boolean
  /** Date d'ajout au catalogue (AAAA-MM-JJ), sert à trier « Nouveautés ». */
  addedAt: string
}

export interface ConsoleProduct extends BaseProduct {
  kind: 'console'
  generation: Platform
  /** Ex. « Slim », « Pro », « Digital Edition ». */
  variant: string
  storage?: string
  condition: Condition
  /** À renseigner uniquement si les accessoires sont confirmés. */
  accessories?: string[]
  /** À renseigner uniquement si PIXEL PLAY propose réellement une garantie. */
  warranty?: string
}

export interface PhysicalGameProduct extends BaseProduct {
  kind: 'game-physical'
  platform: Platform
  condition: Condition
}

export interface DigitalGameProduct extends BaseProduct {
  kind: 'game-digital'
  platform: Platform
  /** « code » : clé à activer. « compte » : accès à un compte de jeux (conditions renforcées). */
  digitalType: DigitalType
  /** Conditions de vente affichées sur la fiche. Obligatoires pour les comptes. */
  conditions: string[]
}

export interface DeviceProduct extends BaseProduct {
  kind: 'device'
  deviceType: DeviceType
  brand: string
  model: string
  condition: Condition
  /** Caractéristiques affichées sous forme de liste (libellé / valeur). */
  specs: { label: string; value: string }[]
  accessories?: string[]
  warranty?: string
}

export type GameProduct = PhysicalGameProduct | DigitalGameProduct
export type Product = ConsoleProduct | GameProduct | DeviceProduct

export type SortKey = 'recent' | 'price-asc' | 'price-desc' | 'name'
