import { ADDRESS_ONE_LINE } from '../config/site'

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export const FAQ: FaqItem[] = [
  {
    id: 'commander',
    question: 'Comment commander ?',
    answer:
      'Ouvrez un produit et cliquez sur « Commander sur WhatsApp ». Le message est prérempli avec le nom du produit, le prix affiché et sa référence. PIXEL PLAY vous confirme ensuite la disponibilité, le prix actuel et les modalités de retrait ou de livraison.',
  },
  {
    id: 'prix',
    question: 'Le prix affiché est-il définitif ?',
    answer:
      'Le prix affiché sert de repère. Le prix actuel et la disponibilité sont confirmés sur WhatsApp avant toute commande.',
  },
  {
    id: 'compte',
    question: 'Dois-je créer un compte sur le site ?',
    answer: 'Non. Aucune inscription n’est nécessaire : vous parcourez le catalogue et vous commandez directement sur WhatsApp.',
  },
  {
    id: 'paiement',
    question: 'Peut-on payer en ligne sur le site ?',
    answer:
      'Non. Le site n’enregistre aucun paiement : le règlement, le retrait ou la livraison sont convenus avec PIXEL PLAY dans la conversation WhatsApp.',
  },
  {
    id: 'vendre',
    question: 'Comment vendre mon appareil ?',
    answer:
      'Remplissez le formulaire « Vendre mon appareil », vérifiez le récapitulatif, puis ouvrez WhatsApp avec le message prérempli. PIXEL PLAY étudie votre proposition et vous répond avec une estimation. Il s’agit d’une demande : aucun rachat n’est conclu avant sa confirmation.',
  },
  {
    id: 'photos',
    question: 'Mes photos sont-elles envoyées automatiquement ?',
    answer:
      'Non. Un lien WhatsApp ne peut pas joindre de fichiers : le site ajoute le nombre de photos au message, et vous les joignez vous-même dans la conversation WhatsApp.',
  },
  {
    id: 'numerique',
    question: 'Que sont les jeux numériques et les comptes de jeux ?',
    answer:
      'Ce sont des produits sans disque : un code à activer sur votre compte, ou l’accès à un compte de jeux lorsque cette vente est autorisée. Les conditions, restrictions et modalités de transfert sont précisées avant tout paiement. Ne communiquez jamais le mot de passe de votre propre compte.',
  },
  {
    id: 'adresse',
    question: 'Où se trouve PIXEL PLAY ?',
    answer: `${ADDRESS_ONE_LINE}. Retrouvez le lien de recherche sur la carte dans la page Contact.`,
  },
]
