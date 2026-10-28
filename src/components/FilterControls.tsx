import { useId, useState, type ReactNode } from 'react'
import { FilterIcon, SearchIcon } from './Icons'

interface ShellProps {
  query: string
  onQuery: (value: string) => void
  searchLabel: string
  searchPlaceholder: string
  /** Nombre de filtres actifs (affiché sur le bouton mobile). */
  activeCount: number
  /** Texte annoncé aux lecteurs d'écran : « 5 résultats ». */
  resultsText: string
  onReset: () => void
  children: ReactNode
}

/**
 * Cadre commun des filtres : recherche toujours visible, filtres repliables sur mobile,
 * toujours affichés sur ordinateur, résumé du nombre de résultats annoncé aux lecteurs d'écran.
 */
export function FilterShell({
  query,
  onQuery,
  searchLabel,
  searchPlaceholder,
  activeCount,
  resultsText,
  onReset,
  children,
}: ShellProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const searchId = useId()

  return (
    <section className={`filters${open ? ' is-open' : ''}`} aria-label="Recherche et filtres">
      <div className="filters__top">
        <div className="search-field">
          <label htmlFor={searchId} className="sr-only">
            {searchLabel}
          </label>
          <SearchIcon size={20} className="search-field__icon" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            enterKeyHint="search"
          />
        </div>
        <button
          type="button"
          className="btn btn--outline filters__toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          <FilterIcon size={20} />
          Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      <div id={panelId} className="filters__panel">
        {children}
      </div>

      <div className="filters__summary">
        <p aria-live="polite" role="status">
          {resultsText}
        </p>
        {activeCount > 0 && (
          <button type="button" className="link-btn" onClick={onReset}>
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </section>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  hint?: string
}

export function SelectField({ label, value, onChange, options, hint }: SelectProps) {
  const id = useId()
  const hintId = `${id}-hint`
  return (
    <div className="control">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={hint ? hintId : undefined}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={hintId} className="control__hint">
          {hint}
        </p>
      )}
    </div>
  )
}

interface AmountProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function AmountField({ label, value, onChange, placeholder }: AmountProps) {
  const id = useId()
  return (
    <div className="control">
      <label htmlFor={id}>{label}</label>
      <div className="control__suffix">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/[^\d\s]/g, ''))}
        />
        <span aria-hidden="true">FCFA</span>
      </div>
    </div>
  )
}

interface CheckProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckField({ label, checked, onChange }: CheckProps) {
  const id = useId()
  return (
    <div className="control control--check">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Nouveautés' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'name', label: 'Nom (A → Z)' },
]

export const CONDITION_FILTER_OPTIONS = [
  { value: '', label: 'Tous les états' },
  { value: 'neuf', label: 'Neuf' },
  { value: 'occasion', label: 'Occasion' },
]

export function pluralResults(n: number): string {
  if (n === 0) return 'Aucun résultat'
  return n === 1 ? '1 résultat' : `${n} résultats`
}
