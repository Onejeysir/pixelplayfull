import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { withParam } from '../lib/catalog'

/**
 * Les filtres du catalogue vivent dans l'URL (?plateforme=PS5&etat=neuf…) :
 * - le bouton Retour du navigateur retrouve les filtres après une visite de fiche produit ;
 * - une recherche peut être partagée par lien ;
 * - les changements de filtre remplacent l'entrée d'historique (pas de pile de « retours » interminable).
 */
export function useUrlParams() {
  const [params, setParams] = useSearchParams()

  /**
   * Modifie plusieurs paramètres en UNE seule mise à jour d'URL.
   * (React Router ne met pas en file les mises à jour fonctionnelles : deux appels `set` consécutifs
   * dans le même événement s'écraseraient, le second repartant de l'ancienne URL.)
   */
  const setMany = useCallback(
    (updates: Record<string, string | undefined>) => {
      setParams(
        (prev) => Object.entries(updates).reduce((next, [key, value]) => withParam(next, key, value), prev),
        { replace: true },
      )
    },
    [setParams],
  )

  const set = useCallback((key: string, value: string | undefined) => setMany({ [key]: value }), [setMany])

  const reset = useCallback(
    (keep: string[] = []) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams()
          for (const key of keep) {
            const value = prev.get(key)
            if (value) next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { params, set, setMany, reset }
}
