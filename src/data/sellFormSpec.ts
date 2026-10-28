/**
 * Spécification déclarative du formulaire « Vendre mon appareil ».
 * Source unique pour : l'affichage des champs, la validation et le message WhatsApp.
 * Pour ajouter un champ, il suffit d'ajouter une entrée ici.
 */

export type DeviceCategory = 'ordinateur' | 'telephone' | 'console'
export type FieldKind = 'text' | 'tel' | 'number' | 'select' | 'textarea' | 'checkbox'
export type FormValues = Record<string, string>

export interface FieldOption {
  value: string
  label: string
}

export interface FieldSpec {
  key: string
  label: string
  kind: FieldKind
  required?: boolean
  options?: readonly FieldOption[]
  placeholder?: string
  hint?: string
  maxLength?: number
  autoComplete?: string
  inputMode?: 'text' | 'numeric' | 'tel'
  /** Le champ n'est affiché (et pris en compte) que si cette fonction renvoie true. */
  showIf?: (values: FormValues) => boolean
}

export interface FieldGroup {
  id: string
  title: string
  description?: string
  fields: FieldSpec[]
}

const opts = (labels: readonly string[]): FieldOption[] => labels.map((l) => ({ value: l, label: l }))

export const CATEGORY_META: Record<
  DeviceCategory,
  { label: string; description: string; brandPlaceholder: string; modelPlaceholder: string }
> = {
  ordinateur: {
    label: 'Ordinateur',
    description: 'Portable ou de bureau',
    brandPlaceholder: 'ex. HP, Dell, Lenovo',
    modelPlaceholder: 'ex. ProBook 450 G7',
  },
  telephone: {
    label: 'Téléphone',
    description: 'Smartphone ou mobile',
    brandPlaceholder: 'ex. Samsung, Apple, Tecno',
    modelPlaceholder: 'ex. Galaxy A54',
  },
  console: {
    label: 'Console de jeux',
    description: 'PlayStation, Xbox, Switch…',
    brandPlaceholder: 'ex. Sony, Microsoft, Nintendo',
    modelPlaceholder: 'ex. PS5 Slim',
  },
}

export const CATEGORY_ORDER: DeviceCategory[] = ['ordinateur', 'telephone', 'console']

export const CONDITION_OPTIONS = opts([
  'Comme neuf',
  'Très bon état',
  'Bon état',
  'État correct (traces d’usage)',
  'À réparer ou pour pièces',
])

export const LAPTOP = 'Ordinateur portable'
export const DESKTOP = 'Ordinateur de bureau'
export const DIGITAL_EDITION = 'Digital (sans lecteur)'
export const NO_CONTROLLER = '0'

const UNKNOWN = 'Je ne sais pas'

/** Champs « Vos coordonnées » : communs aux trois catégories. */
export const SELLER_FIELDS: FieldSpec[] = [
  {
    key: 'fullName',
    label: 'Nom complet',
    kind: 'text',
    required: true,
    autoComplete: 'name',
    maxLength: 80,
    placeholder: 'Prénom et nom',
  },
  {
    key: 'phone',
    label: 'Numéro de téléphone',
    kind: 'tel',
    required: true,
    autoComplete: 'tel',
    inputMode: 'tel',
    maxLength: 20,
    placeholder: 'ex. 6 97 69 25 98',
    hint: 'Numéro joignable, de préférence sur WhatsApp.',
  },
  {
    key: 'location',
    label: 'Localisation',
    kind: 'text',
    required: true,
    maxLength: 80,
    placeholder: 'Quartier et ville, ex. Bonamoussadi, Douala',
  },
]

const SPECS_BY_CATEGORY: Record<DeviceCategory, FieldSpec[]> = {
  ordinateur: [
    { key: 'computerType', label: 'Type d’ordinateur', kind: 'select', required: true, options: opts([LAPTOP, DESKTOP]) },
    { key: 'cpu', label: 'Processeur', kind: 'text', required: true, maxLength: 60, placeholder: 'ex. Intel Core i5-10210U' },
    {
      key: 'ram',
      label: 'Mémoire RAM',
      kind: 'select',
      required: true,
      options: opts(['4 Go', '8 Go', '12 Go', '16 Go', '32 Go', '64 Go ou plus', UNKNOWN]),
    },
    {
      key: 'storageSize',
      label: 'Capacité de stockage',
      kind: 'select',
      required: true,
      options: opts(['128 Go', '256 Go', '512 Go', '1 To', '2 To ou plus', UNKNOWN]),
    },
    {
      key: 'storageType',
      label: 'Type de stockage',
      kind: 'select',
      required: true,
      options: opts(['SSD', 'HDD', 'SSD + HDD', UNKNOWN]),
    },
    { key: 'gpu', label: 'Carte graphique (si applicable)', kind: 'text', maxLength: 60, placeholder: 'ex. NVIDIA GTX 1650' },
    { key: 'screenSize', label: 'Taille d’écran (si applicable)', kind: 'text', maxLength: 30, placeholder: 'ex. 15,6 pouces' },
    {
      key: 'battery',
      label: 'État de la batterie',
      kind: 'select',
      options: opts(['Très bonne autonomie', 'Autonomie correcte', 'Autonomie faible', 'Ne tient plus la charge', UNKNOWN]),
      showIf: (v) => v.computerType === LAPTOP,
    },
  ],
  telephone: [
    {
      key: 'storage',
      label: 'Capacité de stockage',
      kind: 'select',
      required: true,
      options: opts(['16 Go', '32 Go', '64 Go', '128 Go', '256 Go', '512 Go', '1 To']),
    },
    {
      key: 'ram',
      label: 'Mémoire RAM (si connue)',
      kind: 'select',
      options: opts(['2 Go', '3 Go', '4 Go', '6 Go', '8 Go', '12 Go ou plus', UNKNOWN]),
    },
    {
      key: 'screenCondition',
      label: 'État de l’écran',
      kind: 'select',
      required: true,
      options: opts(['Parfait', 'Micro-rayures', 'Rayures visibles', 'Fissuré mais fonctionnel', 'À remplacer']),
    },
    {
      key: 'battery',
      label: 'État de la batterie (si disponible)',
      kind: 'select',
      options: opts(['Très bonne autonomie', 'Autonomie correcte', 'Autonomie faible', UNKNOWN]),
    },
  ],
  console: [
    {
      key: 'generation',
      label: 'Modèle et génération',
      kind: 'select',
      required: true,
      options: opts(['PlayStation 4', 'PlayStation 5', 'Xbox One', 'Xbox Series S / X', 'Nintendo Switch', 'Autre']),
    },
    {
      key: 'edition',
      label: 'Version ou édition',
      kind: 'select',
      required: true,
      options: opts(['Standard', 'Slim', 'Pro', DIGITAL_EDITION, 'Autre']),
    },
    {
      key: 'storage',
      label: 'Capacité de stockage (si connue)',
      kind: 'select',
      options: opts(['500 Go', '825 Go', '1 To', '2 To ou plus', UNKNOWN]),
    },
    {
      key: 'discDrive',
      label: 'État du lecteur de disque',
      kind: 'select',
      required: true,
      options: opts(['Fonctionne bien', 'Lit difficilement certains disques', 'Ne lit plus les disques']),
      showIf: (v) => v.edition !== DIGITAL_EDITION,
    },
    {
      key: 'controllersCount',
      label: 'Nombre de manettes fournies',
      kind: 'select',
      required: true,
      options: [
        { value: NO_CONTROLLER, label: 'Aucune' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3 ou plus' },
      ],
    },
    {
      key: 'controllersCondition',
      label: 'État des manettes',
      kind: 'select',
      options: opts(['Comme neuves', 'Bon état', 'Usées (dérive des sticks, boutons)', 'Défectueuses']),
      showIf: (v) => Boolean(v.controllersCount) && v.controllersCount !== NO_CONTROLLER,
    },
  ],
}

function accessoriesField(category: DeviceCategory): FieldSpec {
  return {
    key: 'accessories',
    label: category === 'console' ? 'Jeux et accessoires inclus' : 'Accessoires fournis',
    kind: 'text',
    maxLength: 160,
    placeholder:
      category === 'console'
        ? 'ex. 2 manettes, câble HDMI, 3 jeux'
        : category === 'telephone'
          ? 'ex. chargeur, boîte, coque'
          : 'ex. chargeur, sacoche, souris',
  }
}

const SERIAL_FIELD: FieldSpec = {
  key: 'serial',
  label: 'Numéro de série (facultatif)',
  kind: 'text',
  maxLength: 40,
  autoComplete: 'off',
  hint: 'Facultatif. Si vous le donnez, masquez-le sur les photos que vous partagez.',
}

const IMEI_CHECKBOX: FieldSpec = {
  key: 'identifierOnRequest',
  label: 'Je peux fournir l’IMEI ou le numéro de série en message privé, si PIXEL PLAY en a besoin.',
  kind: 'checkbox',
  hint: 'Ne saisissez pas l’IMEI ici : il n’est jamais inclus dans le message prérempli.',
}

const PRICE_FIELD: FieldSpec = {
  key: 'desiredPrice',
  label: 'Prix souhaité en FCFA (facultatif)',
  kind: 'number',
  inputMode: 'numeric',
  maxLength: 12,
  placeholder: 'ex. 150000',
}

const DESCRIPTION_FIELD: FieldSpec = {
  key: 'description',
  label: 'Description complémentaire',
  kind: 'textarea',
  maxLength: 500,
  placeholder: 'Défauts éventuels, historique, raison de la vente…',
}

/** Champs « Votre appareil » : marque, modèle, état général. */
export function deviceBasics(category: DeviceCategory): FieldSpec[] {
  const meta = CATEGORY_META[category]
  return [
    { key: 'brand', label: 'Marque', kind: 'text', required: true, maxLength: 40, placeholder: meta.brandPlaceholder },
    { key: 'model', label: 'Modèle', kind: 'text', required: true, maxLength: 60, placeholder: meta.modelPlaceholder },
    { key: 'condition', label: 'État général', kind: 'select', required: true, options: CONDITION_OPTIONS },
  ]
}

export function deviceSpecs(category: DeviceCategory): FieldSpec[] {
  return SPECS_BY_CATEGORY[category]
}

export function deviceExtras(category: DeviceCategory): FieldSpec[] {
  return [
    accessoriesField(category),
    category === 'telephone' ? IMEI_CHECKBOX : SERIAL_FIELD,
    PRICE_FIELD,
    DESCRIPTION_FIELD,
  ]
}

/** Groupes de champs visibles pour une catégorie et l'état courant du formulaire. */
export function getFieldGroups(category: DeviceCategory, values: FormValues): FieldGroup[] {
  const visible = (fields: FieldSpec[]) => fields.filter((f) => !f.showIf || f.showIf(values))
  return [
    { id: 'basics', title: 'Votre appareil', fields: visible(deviceBasics(category)) },
    {
      id: 'specs',
      title: 'Caractéristiques',
      description: 'Seules les informations utiles pour ce type d’appareil sont demandées.',
      fields: visible(deviceSpecs(category)),
    },
    { id: 'extras', title: 'Détails complémentaires', fields: visible(deviceExtras(category)) },
    { id: 'seller', title: 'Vos coordonnées', fields: visible(SELLER_FIELDS) },
  ]
}

/** Tous les champs visibles, à plat (validation et message). */
export function getVisibleFields(category: DeviceCategory, values: FormValues): FieldSpec[] {
  return getFieldGroups(category, values).flatMap((g) => g.fields)
}

export function optionLabel(field: FieldSpec, value: string): string {
  return field.options?.find((o) => o.value === value)?.label ?? value
}
