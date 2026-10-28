import type { ReactNode } from 'react'

export type IllustrationKind =
  | 'disc'
  | 'digital'
  | 'console-tall'
  | 'console-flat'
  | 'laptop'
  | 'phone'
  | 'devices'

/**
 * Illustrations génériques en traits épais, dans l'esprit du logo.
 * Elles servent de visuel provisoire tant qu'une vraie photo n'est pas renseignée.
 * Volontairement neutres : aucune marque, aucun symbole de constructeur.
 * Couleurs : trait = currentColor, aplat = var(--ill-fill).
 */
const SHAPES: Record<IllustrationKind, ReactNode> = {
  disc: (
    <>
      <rect x="52" y="22" width="98" height="136" rx="7" fill="var(--ill-fill)" />
      <path d="M70 22v136" />
      <path d="M88 54h44M88 72h30" />
      <circle cx="158" cy="116" r="38" fill="var(--ill-fill)" />
      <circle cx="158" cy="116" r="10" />
    </>
  ),
  digital: (
    <>
      <rect x="40" y="26" width="160" height="104" rx="9" fill="var(--ill-fill)" />
      <path d="M96 156h48M120 130v26" />
      <path d="M120 54v42M102 80l18 18 18-18" />
      <path d="M96 114h48" />
    </>
  ),
  'console-tall': (
    <>
      <rect x="34" y="22" width="58" height="136" rx="14" fill="var(--ill-fill)" />
      <path d="M63 22v136" />
      <circle cx="48" cy="142" r="4" />
      <path d="M118 112h82a16 16 0 0 1 16 16v6a20 20 0 0 1-36 12l-6-8h-28l-6 8a20 20 0 0 1-36-12v-6a16 16 0 0 1 16-16z" fill="var(--ill-fill)" />
      <path d="M142 122v12M136 128h12" />
      <circle cx="192" cy="124" r="3.5" />
      <circle cx="202" cy="132" r="3.5" />
    </>
  ),
  'console-flat': (
    <>
      <path d="M40 40h160l22 52H18z" fill="var(--ill-fill)" />
      <path d="M44 72h152" />
      <circle cx="50" cy="56" r="3.5" />
      <path d="M62 112h116a14 14 0 0 1 14 14v6a18 18 0 0 1-32 11l-6-7h-30l-6 7a18 18 0 0 1-32-11v-6a14 14 0 0 1 14-14z" fill="var(--ill-fill)" transform="translate(-4 0)" />
      <path d="M92 122v12M86 128h12" transform="translate(-4 0)" />
      <circle cx="140" cy="124" r="3.5" transform="translate(-4 0)" />
      <circle cx="150" cy="132" r="3.5" transform="translate(-4 0)" />
    </>
  ),
  laptop: (
    <>
      <rect x="52" y="30" width="136" height="94" rx="7" fill="var(--ill-fill)" />
      <path d="M26 138h188l-14 18H40z" fill="var(--ill-fill)" />
      <path d="M104 147h32" />
    </>
  ),
  phone: (
    <>
      <rect x="80" y="16" width="80" height="148" rx="14" fill="var(--ill-fill)" />
      <path d="M108 34h24" />
      <circle cx="120" cy="148" r="4" />
    </>
  ),
  devices: (
    <>
      <g transform="translate(-6 18) scale(.78)">
        <rect x="52" y="30" width="136" height="94" rx="7" fill="var(--ill-fill)" />
        <path d="M26 138h188l-14 18H40z" fill="var(--ill-fill)" />
      </g>
      <g transform="translate(112 44) scale(.62)">
        <rect x="80" y="16" width="80" height="148" rx="14" fill="var(--ill-fill)" />
        <path d="M108 34h24" />
      </g>
      <path d="M92 20h60M140 10l12 10-12 10" />
    </>
  ),
}

interface Props {
  kind: IllustrationKind
  /** Si fourni, l'illustration est exposée aux lecteurs d'écran ; sinon elle est décorative. */
  label?: string
  className?: string
}

export function Illustration({ kind, label, className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {SHAPES[kind]}
    </svg>
  )
}
