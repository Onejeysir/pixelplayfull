import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../config/site'
import { FAQ } from '../data/faq'
import { ArrowLeftIcon, ChevronDownIcon, InfoIcon } from './Icons'

/** Bandeau affiché tant que les produits et prix sont des exemples (voir src/data/products.ts). */
export function DemoNotice() {
  if (!SITE.showDemoNotice) return null
  return (
    <p className="demo-notice" role="note">
      <InfoIcon size={18} />
      <span>
        <strong>Données de démonstration.</strong> Les produits, prix et stocks affichés sont des exemples : ils seront
        remplacés par le catalogue réel de PIXEL PLAY.
      </span>
    </p>
  )
}

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="Fil d’Ariane">
      <ol>
        {items.map((item, i) => (
          <li key={item.label}>
            {item.to && i < items.length - 1 ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

interface PageHeaderProps {
  title: string
  intro?: ReactNode
  eyebrow?: string
  crumbs?: Crumb[]
  children?: ReactNode
}

export function PageHeader({ title, intro, eyebrow, crumbs, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="container">
        {crumbs && <Breadcrumb items={crumbs} />}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-header__title">{title}</h1>
        {intro && <p className="page-header__intro">{intro}</p>}
        {children}
      </div>
    </header>
  )
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="back-link">
      <ArrowLeftIcon size={18} />
      {children}
    </Link>
  )
}

interface EmptyProps {
  title: string
  children?: ReactNode
  onReset?: () => void
}

export function EmptyState({ title, children, onReset }: EmptyProps) {
  return (
    <div className="empty" role="status">
      <p className="empty__title">{title}</p>
      {children && <p className="empty__text">{children}</p>}
      {onReset && (
        <button type="button" className="btn btn--outline" onClick={onReset}>
          Réinitialiser les filtres
        </button>
      )}
    </div>
  )
}

export function Faq({ ids }: { ids?: string[] }) {
  const items = ids ? FAQ.filter((f) => ids.includes(f.id)) : FAQ
  return (
    <div className="faq">
      {items.map((item) => (
        <details key={item.id} className="faq__item">
          <summary>
            <span>{item.question}</span>
            <ChevronDownIcon size={20} className="faq__chevron" />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  )
}
