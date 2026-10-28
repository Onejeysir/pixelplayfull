import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/Common'
import { CheckIcon, InfoIcon, TrashIcon, UploadIcon, WhatsAppIcon } from '../components/Icons'
import { SITE } from '../config/site'
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  deviceSpecs,
  getFieldGroups,
  optionLabel,
  type DeviceCategory,
  type FieldSpec,
  type FormValues,
} from '../data/sellFormSpec'
import { usePageMeta } from '../hooks/usePageMeta'
import { validateNewPhotos } from '../lib/files'
import { formatPrice } from '../lib/format'
import { checkPhone } from '../lib/phone'
import { isDeviceCategory, parsePrice, validateSellForm } from '../lib/validation'
import { buildSellMessage, buildWhatsAppUrl } from '../lib/whatsapp'

interface Photo {
  id: string
  file: File
  url: string
}

/** Clés propres à une catégorie : elles sont vidées quand on change de type d'appareil. */
const CATEGORY_SPECIFIC_KEYS = new Set<string>([
  ...CATEGORY_ORDER.flatMap((c) => deviceSpecs(c).map((f) => f.key)),
  'identifierOnRequest',
])

let photoCounter = 0

/* -------------------------------------------------------------------------- */
/*  Champ de formulaire piloté par la spécification                             */
/* -------------------------------------------------------------------------- */

interface FieldControlProps {
  spec: FieldSpec
  value: string
  error?: string
  onChange: (key: string, value: string) => void
}

function FieldControl({ spec, value, error, onChange }: FieldControlProps) {
  const id = `field-${spec.key}`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [spec.hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined
  const aria = {
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': describedBy,
    'aria-required': spec.required ? (true as const) : undefined,
  }

  let control
  switch (spec.kind) {
    case 'select':
      control = (
        <select id={id} name={spec.key} value={value} onChange={(e) => onChange(spec.key, e.target.value)} {...aria}>
          <option value="">Choisir…</option>
          {spec.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
      break
    case 'textarea':
      control = (
        <textarea
          id={id}
          name={spec.key}
          rows={4}
          value={value}
          maxLength={spec.maxLength}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(spec.key, e.target.value)}
          {...aria}
        />
      )
      break
    case 'checkbox':
      return (
        <div className="field field--check">
          <label className="checkbox" htmlFor={id}>
            <input
              id={id}
              name={spec.key}
              type="checkbox"
              checked={value === 'true'}
              onChange={(e) => onChange(spec.key, e.target.checked ? 'true' : '')}
              aria-describedby={spec.hint ? hintId : undefined}
            />
            <span>{spec.label}</span>
          </label>
          {spec.hint && (
            <p id={hintId} className="field__hint">
              {spec.hint}
            </p>
          )}
        </div>
      )
    default:
      control = (
        <input
          id={id}
          name={spec.key}
          type={spec.kind === 'tel' ? 'tel' : 'text'}
          inputMode={spec.inputMode}
          autoComplete={spec.autoComplete}
          value={value}
          maxLength={spec.maxLength}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(spec.key, spec.kind === 'number' ? e.target.value.replace(/[^\d\s]/g, '') : e.target.value)}
          {...aria}
        />
      )
  }

  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>
        {spec.label}
        {spec.required && <span aria-hidden="true"> *</span>}
      </label>
      {control}
      {spec.hint && (
        <p id={hintId} className="field__hint">
          {spec.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sélection de photos                                                         */
/* -------------------------------------------------------------------------- */

interface PhotoPickerProps {
  photos: Photo[]
  errors: string[]
  onAdd: (files: File[]) => void
  onRemove: (id: string) => void
}

function PhotoPicker({ photos, errors, onAdd, onRemove }: PhotoPickerProps) {
  const { maxCount, maxSizeMB, allowedLabel, allowedTypes } = SITE.photos
  return (
    <div className="photos">
      <input
        id="photos-input"
        className="photos__input"
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={(e) => {
          onAdd(Array.from(e.target.files ?? []))
          e.target.value = ''
        }}
      />
      <label htmlFor="photos-input" className="btn btn--outline photos__add">
        <UploadIcon size={20} />
        Ajouter des photos
      </label>
      <p className="photos__count">
        {photos.length} / {maxCount} photo{maxCount > 1 ? 's' : ''}
      </p>

      <p className="field__hint">
        Formats {allowedLabel}, {maxSizeMB} Mo maximum par photo. Photographiez l’appareil allumé, l’écran, les angles et
        les défauts éventuels.
      </p>
      <p className="photos__notice">
        <InfoIcon size={18} />
        <span>
          Les photos ne sont <strong>pas envoyées automatiquement</strong> par le site. Après avoir ouvert WhatsApp, vous
          les joindrez vous-même dans la conversation (icône « + » ou trombone).
        </span>
      </p>

      <div aria-live="polite">
        {errors.length > 0 && (
          <ul className="photos__errors" data-testid="photo-errors">
            {errors.map((e) => (
              <li key={e} className="field__error">
                {e}
              </li>
            ))}
          </ul>
        )}
      </div>

      {photos.length > 0 && (
        <ul className="photo-list" aria-label="Photos sélectionnées">
          {photos.map((photo, i) => (
            <li key={photo.id} className="photo-list__item">
              <img src={photo.url} alt={`Aperçu de la photo ${i + 1} : ${photo.file.name}`} />
              <span className="photo-list__name">{photo.file.name}</span>
              <button
                type="button"
                className="photo-list__remove"
                aria-label={`Retirer la photo ${photo.file.name}`}
                onClick={() => onRemove(photo.id)}
              >
                <TrashIcon size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Récapitulatif avant WhatsApp                                                */
/* -------------------------------------------------------------------------- */

interface RecapProps {
  category: DeviceCategory
  values: FormValues
  photos: Photo[]
  onEdit: () => void
}

function Recap({ category, values, photos, onEdit }: RecapProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'failed'>('idle')

  useEffect(() => {
    headingRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const message = buildSellMessage({ category, values, photoCount: photos.length })
  const href = buildWhatsAppUrl(message)

  const rows: { label: string; value: string }[] = [{ label: 'Catégorie', value: CATEGORY_META[category].label }]
  for (const group of getFieldGroups(category, values)) {
    for (const field of group.fields) {
      const raw = (values[field.key] ?? '').trim()
      if (!raw) continue
      let shown = field.kind === 'select' ? optionLabel(field, raw) : raw
      if (field.kind === 'checkbox') shown = 'Oui'
      if (field.key === 'phone') shown = checkPhone(raw).display ?? raw
      if (field.key === 'desiredPrice') {
        const price = parsePrice(raw)
        if (price !== undefined) shown = formatPrice(price)
      }
      rows.push({ label: field.label.replace(/\s*\(.*\)\s*$/, ''), value: shown })
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopyState('done')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <section className="recap" aria-labelledby="recap-title">
      <h2 id="recap-title" ref={headingRef} tabIndex={-1}>
        Vérifiez votre demande
      </h2>
      <p className="recap__lead">
        Rien n’a encore été envoyé. Si tout est correct, ouvrez WhatsApp : le message ci-dessous sera prérempli.
      </p>

      <dl className="recap__list">
        {rows.map((row) => (
          <div key={row.label} className="recap__row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
        <div className="recap__row">
          <dt>Photos</dt>
          <dd>
            {photos.length === 0
              ? 'Aucune photo sélectionnée'
              : `${photos.length} photo${photos.length > 1 ? 's' : ''} à joindre dans WhatsApp`}
          </dd>
        </div>
      </dl>

      {photos.length > 0 && (
        <ul className="photo-strip" aria-label="Aperçu des photos à joindre">
          {photos.map((p, i) => (
            <li key={p.id}>
              <img src={p.url} alt={`Photo ${i + 1} : ${p.file.name}`} />
            </li>
          ))}
        </ul>
      )}

      <div className="callout" role="note">
        <InfoIcon size={22} />
        <div>
          <p className="callout__title">Comment transmettre vos photos</p>
          <ol>
            <li>Cliquez sur « Ouvrir WhatsApp » : la conversation s’ouvre avec votre demande déjà écrite.</li>
            <li>
              Dans WhatsApp, joignez {photos.length > 0 ? `vos ${photos.length} photo${photos.length > 1 ? 's' : ''}` : 'vos photos'} avec
              l’icône « + » ou le trombone.
            </li>
            <li>Envoyez le tout : PIXEL PLAY étudie votre proposition et vous répond avec une estimation.</li>
          </ol>
          <p>
            Il s’agit d’une <strong>demande d’estimation</strong> : l’appareil n’est ni accepté ni racheté tant que
            PIXEL PLAY ne l’a pas confirmé.
          </p>
        </div>
      </div>

      <div className="form-actions" data-hide-wa>
        <button type="button" className="btn btn--outline" onClick={onEdit}>
          Modifier ma demande
        </button>
        <a className="btn btn--primary" href={href} target="_blank" rel="noopener noreferrer" data-testid="sell-whatsapp">
          <WhatsAppIcon size={20} />
          Ouvrir WhatsApp avec ma demande
          <span className="sr-only"> (s’ouvre dans un nouvel onglet)</span>
        </a>
      </div>

      <div className="recap__copy">
        <button type="button" className="link-btn" onClick={copy}>
          WhatsApp ne s’ouvre pas ? Copier le message
        </button>
        <p role="status" aria-live="polite">
          {copyState === 'done' && (
            <>
              <CheckIcon size={16} /> Message copié : collez-le dans une conversation avec {SITE.phone.display}.
            </>
          )}
        </p>
        {copyState === 'failed' && (
          <div>
            <label htmlFor="recap-message">Copiez ce message manuellement :</label>
            <textarea id="recap-message" readOnly rows={10} value={message} onFocus={(e) => e.currentTarget.select()} />
          </div>
        )}
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                        */
/* -------------------------------------------------------------------------- */

export function SellDevicePage() {
  usePageMeta(
    'Vendre mon appareil',
    'Proposez votre ordinateur, téléphone ou console à PIXEL PLAY : remplissez le formulaire, vérifiez le récapitulatif et envoyez votre demande d’estimation sur WhatsApp.',
    '/vendre-mon-appareil',
  )

  const [searchParams] = useSearchParams()
  const initial = searchParams.get('categorie') ?? ''

  const [category, setCategory] = useState<DeviceCategory | ''>(isDeviceCategory(initial) ? initial : '')
  const [values, setValues] = useState<FormValues>({})
  const [consent, setConsent] = useState(false)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [photoErrors, setPhotoErrors] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [attempted, setAttempted] = useState(false)
  const [step, setStep] = useState<'edit' | 'review'>('edit')
  const summaryRef = useRef<HTMLDivElement>(null)

  // Libère les aperçus (URL objet) à la fermeture de la page.
  const photosRef = useRef(photos)
  photosRef.current = photos
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), [])

  // Après une première tentative, les erreurs se mettent à jour en direct.
  useEffect(() => {
    if (attempted) setErrors(validateSellForm(category, values, consent).errors)
  }, [attempted, category, values, consent])

  const changeCategory = (next: DeviceCategory) => {
    if (next === category) return
    setCategory(next)
    // Les réponses propres à l'ancienne catégorie sont retirées : elles ne partiront jamais dans le message.
    setValues((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !CATEGORY_SPECIFIC_KEYS.has(k))))
  }

  const changeValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }))

  const addPhotos = (files: File[]) => {
    const { accepted, errors: photoProblems } = validateNewPhotos(
      photos.map((p) => p.file),
      files,
      SITE.photos,
    )
    setPhotoErrors(photoProblems)
    if (accepted.length > 0) {
      setPhotos((prev) => [
        ...prev,
        ...accepted.map((file) => ({ id: `photo-${++photoCounter}`, file, url: URL.createObjectURL(file) })),
      ])
    }
  }

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((p) => p.id !== id)
    })
    setPhotoErrors([])
  }

  const onReview = (e: FormEvent) => {
    e.preventDefault()
    setAttempted(true)
    const result = validateSellForm(category, values, consent)
    setErrors(result.errors)
    if (result.valid) {
      setStep('review')
    } else {
      // Le résumé reçoit le focus : les lecteurs d'écran annoncent le nombre d'erreurs.
      requestAnimationFrame(() => summaryRef.current?.focus())
    }
  }

  const errorKeys = Object.keys(errors)
  const groups = category ? getFieldGroups(category, values) : []

  const focusField = (key: string) => {
    const id = key === 'category' ? `category-${CATEGORY_ORDER[0]}` : key === 'consent' ? 'consent' : `field-${key}`
    document.getElementById(id)?.focus()
  }

  const labelFor = (key: string): string => {
    if (key === 'category') return 'Type d’appareil'
    if (key === 'consent') return 'Autorisation d’envoi'
    for (const g of groups) {
      const f = g.fields.find((x) => x.key === key)
      if (f) return f.label.replace(/\s*\(.*\)\s*$/, '')
    }
    return key
  }

  return (
    <>
      <PageHeader
        title="Vendre mon appareil"
        intro="Proposez votre ordinateur, téléphone ou console à PIXEL PLAY pour une estimation et un éventuel rachat."
        crumbs={[
          { label: 'Accueil', to: '/' },
          { label: 'Achat / Vente', to: '/appareils' },
          { label: 'Vendre mon appareil' },
        ]}
      />

      <div className="container sell">
        {step === 'review' && category ? (
          <Recap category={category} values={values} photos={photos} onEdit={() => setStep('edit')} />
        ) : (
          <form className="sell-form" noValidate onSubmit={onReview} aria-label="Formulaire de vente d’appareil">
            <ol className="steps-inline" aria-label="Étapes">
              <li>Remplissez le formulaire</li>
              <li>Vérifiez le récapitulatif</li>
              <li>Ouvrez WhatsApp et joignez vos photos</li>
            </ol>
            <p className="required-note">Les champs marqués d’un * sont obligatoires.</p>

            {errorKeys.length > 0 && (
              <div ref={summaryRef} className="error-summary" role="alert" tabIndex={-1}>
                <p className="error-summary__title">
                  {errorKeys.length === 1 ? '1 information à corriger' : `${errorKeys.length} informations à corriger`}
                </p>
                <ul>
                  {errorKeys.map((key) => (
                    <li key={key}>
                      <a
                        href={`#field-${key}`}
                        onClick={(e) => {
                          e.preventDefault()
                          focusField(key)
                        }}
                      >
                        {labelFor(key)}
                      </a>{' '}
                      : {errors[key]}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <fieldset className="form-section">
              <legend>Quel appareil proposez-vous ?</legend>
              <div className="category-picker" role="radiogroup" aria-label="Type d’appareil" aria-required="true">
                {CATEGORY_ORDER.map((c) => (
                  <div key={c} className="category-picker__option">
                    <input
                      type="radio"
                      id={`category-${c}`}
                      name="category"
                      value={c}
                      checked={category === c}
                      onChange={() => changeCategory(c)}
                    />
                    <label htmlFor={`category-${c}`}>
                      <span className="category-picker__name">{CATEGORY_META[c].label}</span>
                      <span className="category-picker__desc">{CATEGORY_META[c].description}</span>
                    </label>
                  </div>
                ))}
              </div>
              {errors.category && <p className="field__error">{errors.category}</p>}
            </fieldset>

            {!category && (
              <p className="sell__prompt">
                Choisissez un type d’appareil : seuls les champs utiles pour celui-ci s’afficheront.
              </p>
            )}

            {category &&
              groups.map((group) => (
                <div key={group.id} className="form-block">
                  <fieldset className="form-section">
                    <legend>{group.title}</legend>
                    {group.description && <p className="form-section__desc">{group.description}</p>}
                    <div className="form-grid">
                      {group.fields.map((field) => (
                        <FieldControl
                          key={`${category}-${field.key}`}
                          spec={field}
                          value={values[field.key] ?? ''}
                          error={errors[field.key]}
                          onChange={changeValue}
                        />
                      ))}
                    </div>
                  </fieldset>

                  {group.id === 'extras' && (
                    <fieldset className="form-section">
                      <legend>Photos de l’appareil</legend>
                      <PhotoPicker photos={photos} errors={photoErrors} onAdd={addPhotos} onRemove={removePhoto} />
                    </fieldset>
                  )}
                </div>
              ))}

            {category && (
              <>
                <fieldset className="form-section">
                  <legend>Utilisation de vos informations</legend>
                  <p className="form-section__desc">
                    Ces informations servent uniquement à étudier votre demande. Le site ne les enregistre pas : elles
                    sont transmises à PIXEL PLAY, via WhatsApp, lorsque vous ouvrez la conversation. Vos photos restent
                    sur votre appareil jusqu’à ce que vous les joigniez vous-même. Voir la{' '}
                    <Link to="/confidentialite">politique de confidentialité</Link>.
                  </p>
                  <div className={`field field--check${errors.consent ? ' field--error' : ''}`}>
                    <label className="checkbox" htmlFor="consent">
                      <input
                        id="consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        aria-required="true"
                        aria-invalid={errors.consent ? true : undefined}
                        aria-describedby={errors.consent ? 'consent-error' : undefined}
                      />
                      <span>
                        J’autorise l’envoi de ces informations à PIXEL PLAY via WhatsApp pour étudier ma demande. *
                      </span>
                    </label>
                    {errors.consent && (
                      <p id="consent-error" className="field__error">
                        {errors.consent}
                      </p>
                    )}
                  </div>
                </fieldset>

                <div className="form-actions" data-hide-wa>
                  <button type="submit" className="btn btn--primary btn--lg">
                    Vérifier ma demande
                  </button>
                  <p className="form-actions__note">Rien n’est envoyé à cette étape.</p>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </>
  )
}
