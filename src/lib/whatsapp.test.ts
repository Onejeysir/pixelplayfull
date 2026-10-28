import { describe, expect, it } from 'vitest'
import { consoles, devices, digitalGames, physicalGames } from '../data/products'
import { buildContactMessage, buildProductOrderMessage, buildSellMessage, buildWhatsAppUrl, oneLine } from './whatsapp'

/** Décode le message d'une URL wa.me pour vérifier son contenu réel. */
function decode(url: string): { path: string; text: string } {
  const u = new URL(url)
  return { path: `${u.origin}${u.pathname}`, text: u.searchParams.get('text') ?? '' }
}

describe('buildWhatsAppUrl', () => {
  it('cible le bon numéro au format international sans espaces ni « + »', () => {
    const { path } = decode(buildWhatsAppUrl('Bonjour'))
    expect(path).toBe('https://wa.me/237697692598')
  })

  it('encode correctement accents, retours à la ligne, &, # et émojis', () => {
    const message = 'Prix : 445 000 FCFA\nÉtat : occasion & neuf #1 — à tester 🎮'
    const url = buildWhatsAppUrl(message)
    expect(url).not.toMatch(/\s/)
    expect(url).not.toContain('\n')
    expect(url.split('?text=')[1]).toBe(encodeURIComponent(message))
    expect(decode(url).text).toBe(message)
  })
})

describe('buildProductOrderMessage', () => {
  const ps5 = consoles.find((c) => c.id === 'console-ps5-standard-neuf')!
  const msg = buildProductOrderMessage(ps5)

  it('suit le modèle « console » du cahier des charges avec les vraies valeurs du produit', () => {
    expect(msg).toContain('Bonjour PIXEL PLAY,')
    expect(msg).toContain('Je souhaite commander une console.')
    expect(msg).toContain(`- Produit : ${ps5.name}`)
    expect(msg).toContain(`- Variante : ${ps5.variant}`)
    expect(msg).toContain('- État : Neuf')
    expect(msg).toContain('- Prix affiché : 445 000 FCFA')
    expect(msg).toContain(`- Référence : ${ps5.id}`)
    expect(msg).toContain('Merci de me confirmer la disponibilité, le prix actuel et les modalités de retrait ou de livraison.')
  })

  it('contient le bon produit pour chaque console du catalogue', () => {
    for (const c of consoles) {
      const m = buildProductOrderMessage(c)
      expect(m).toContain(c.name)
      expect(m).toContain(`Référence : ${c.id}`)
    }
  })

  it('jeu sur disque : plateforme, catégorie « Physique » et état', () => {
    const game = physicalGames.find((g) => g.platform === 'PS4' && g.condition === 'occasion')!
    const m = buildProductOrderMessage(game)
    expect(m).toContain('Je souhaite commander un jeu vidéo.')
    expect(m).toContain(`- Jeu : ${game.name}`)
    expect(m).toContain('- Plateforme : PS4')
    expect(m).toContain('- Catégorie : Physique (disque)')
    expect(m).toContain('- État : Occasion')
  })

  it('jeu numérique : catégorie « Numérique » sans ligne d’état', () => {
    const code = digitalGames.find((g) => g.digitalType === 'code')!
    const m = buildProductOrderMessage(code)
    expect(m).toContain('- Catégorie : Numérique')
    expect(m).toContain('- Type : Code de jeu')
    expect(m).not.toContain('- État :')
  })

  it('compte de jeux : jamais présenté comme un produit physique', () => {
    const account = digitalGames.find((g) => g.digitalType === 'compte')!
    const m = buildProductOrderMessage(account)
    expect(m).toContain('- Type : Compte de jeux')
    expect(m).not.toContain('Physique')
  })

  it('appareil : message d’achat avec catégorie et état', () => {
    const phone = devices.find((d) => d.deviceType === 'telephone')!
    const m = buildProductOrderMessage(phone)
    expect(m).toContain('Je souhaite acheter un appareil disponible.')
    expect(m).toContain('- Catégorie : Téléphone')
    expect(m).toContain(`Référence : ${phone.id}`)
  })

  it('produit épuisé : demande d’être prévenu au lieu d’une commande', () => {
    const soldOut = consoles.find((c) => c.availability === 'out_of_stock')!
    const m = buildProductOrderMessage(soldOut)
    expect(m).toContain('indiqué épuisé')
    expect(m).not.toContain('Je souhaite commander')
  })

  it('le message ne contient aucun placeholder non remplacé', () => {
    for (const p of [...consoles, ...physicalGames, ...digitalGames, ...devices]) {
      expect(buildProductOrderMessage(p)).not.toMatch(/\[[^\]]+\]|undefined|NaN|null/)
    }
  })
})

describe('buildContactMessage', () => {
  it('est un message simple prêt à envoyer', () => {
    expect(buildContactMessage()).toMatch(/^Bonjour PIXEL PLAY,/)
  })
})

describe('oneLine', () => {
  it('neutralise les sauts de ligne et espaces multiples d’une saisie libre', () => {
    expect(oneLine('  ligne 1\n- Prix : 1 FCFA\r\n\t  fin  ')).toBe('ligne 1 - Prix : 1 FCFA fin')
  })
})

describe('buildSellMessage', () => {
  const base = {
    fullName: 'Marie Ngo',
    phone: '697692598',
    location: 'Bonamoussadi, Douala',
    brand: 'HP',
    model: 'ProBook 450 G7',
    condition: 'Très bon état',
  }

  it('ordinateur portable : champs saisis, caractéristiques et mention des photos à joindre', () => {
    const m = buildSellMessage({
      category: 'ordinateur',
      photoCount: 3,
      values: {
        ...base,
        computerType: 'Ordinateur portable',
        cpu: 'Intel Core i5',
        ram: '8 Go',
        storageSize: '256 Go',
        storageType: 'SSD',
        battery: 'Autonomie correcte',
        desiredPrice: '150000',
        accessories: 'chargeur',
        description: 'Très peu servi',
      },
    })
    expect(m).toContain('Je souhaite proposer un appareil pour estimation et éventuel rachat.')
    expect(m).toContain('- Nom : Marie Ngo')
    expect(m).toContain('- Téléphone : +237 6 97 69 25 98')
    expect(m).toContain('- Catégorie : Ordinateur')
    expect(m).toContain('- Modèle : ProBook 450 G7')
    expect(m).toContain('• Processeur : Intel Core i5')
    expect(m).toContain('• Mémoire RAM : 8 Go')
    expect(m).toContain('• État de la batterie : Autonomie correcte')
    expect(m).toContain('- Prix souhaité : 150 000 FCFA')
    expect(m).toContain("- Nombre d'images sélectionnées : 3")
    expect(m).toContain('- Les images seront jointes directement dans cette conversation WhatsApp.')
  })

  it('n’affiche pas de champ batterie pour un ordinateur de bureau', () => {
    const m = buildSellMessage({
      category: 'ordinateur',
      photoCount: 0,
      values: { ...base, computerType: 'Ordinateur de bureau', cpu: 'Ryzen 5', ram: '16 Go', storageSize: '512 Go', storageType: 'SSD', battery: 'Autonomie faible' },
    })
    expect(m).not.toContain('batterie')
  })

  it('numéro de série et prix absents : « Non renseigné », jamais de valeur inventée', () => {
    const m = buildSellMessage({
      category: 'console',
      photoCount: 0,
      values: { ...base, generation: 'PlayStation 5', edition: 'Standard', discDrive: 'Fonctionne bien', controllersCount: '1' },
    })
    expect(m).toContain('- Numéro de série : Non renseigné')
    expect(m).toContain('- Prix souhaité : Non renseigné')
    expect(m).toContain('- Accessoires : Non renseigné')
    expect(m).toContain('Aucune photo sélectionnée')
    expect(m).not.toContain('seront jointes')
  })

  it('téléphone : l’IMEI n’est jamais demandé ni inclus, seulement la possibilité de le fournir ensuite', () => {
    const m = buildSellMessage({
      category: 'telephone',
      photoCount: 2,
      values: {
        ...base,
        storage: '128 Go',
        screenCondition: 'Parfait',
        identifierOnRequest: 'true',
        serial: '356938035643809', // ne doit jamais partir : ce champ n'existe pas pour les téléphones
      },
    })
    expect(m).toContain('à fournir en message privé si nécessaire')
    expect(m).not.toContain('356938035643809')
  })

  it('ne reprend aucune réponse d’une autre catégorie (champs masqués)', () => {
    const m = buildSellMessage({
      category: 'console',
      photoCount: 0,
      values: { ...base, generation: 'PlayStation 4', edition: 'Pro', discDrive: 'Fonctionne bien', controllersCount: '0', cpu: 'Intel Core i9', ram: '64 Go' },
    })
    expect(m).not.toContain('Intel Core i9')
    expect(m).not.toContain('64 Go')
  })

  it('une saisie multi-lignes ne peut pas fabriquer de fausses lignes de message', () => {
    const m = buildSellMessage({
      category: 'console',
      photoCount: 0,
      values: { ...base, description: 'RAS\n- Prix souhaité : 1 FCFA', generation: 'PlayStation 5', edition: 'Standard', discDrive: 'Fonctionne bien', controllersCount: '1' },
    })
    const descLine = m.split('\n').find((l) => l.startsWith('- Description'))!
    expect(descLine).toContain('RAS - Prix souhaité : 1 FCFA')
    expect(m.split('\n').filter((l) => l.startsWith('- Prix souhaité'))).toHaveLength(1)
  })

  it('le message complet est encodé sans perte dans l’URL wa.me', () => {
    const m = buildSellMessage({
      category: 'console',
      photoCount: 1,
      values: { ...base, generation: 'PlayStation 5', edition: 'Standard', discDrive: 'Fonctionne bien', controllersCount: '2', controllersCondition: 'Bon état', description: 'Accents éàù & #symboles' },
    })
    expect(decode(buildWhatsAppUrl(m)).text).toBe(m)
  })
})
