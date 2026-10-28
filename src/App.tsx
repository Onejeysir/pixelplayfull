import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConsolesPage } from './pages/ConsolesPage'
import { ContactPage } from './pages/ContactPage'
import { DevicesPage } from './pages/DevicesPage'
import { GamesPage } from './pages/GamesPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductPage } from './pages/ProductPage'
import { SearchPage } from './pages/SearchPage'

// Le formulaire de vente est la page la plus lourde : elle n'est chargée qu'à la demande (connexion mobile limitée).
const SellDevicePage = lazy(() => import('./pages/SellDevicePage').then((m) => ({ default: m.SellDevicePage })))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))

function Loading() {
  return (
    <div className="container loading" role="status" aria-live="polite">
      Chargement…
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="jeux" element={<GamesPage kind="all" />} />
        <Route path="jeux/numeriques" element={<GamesPage kind="digital" />} />
        <Route path="jeux/physiques" element={<GamesPage kind="physical" />} />
        <Route path="consoles" element={<ConsolesPage />} />
        <Route path="appareils" element={<DevicesPage />} />
        <Route
          path="vendre-mon-appareil"
          element={
            <Suspense fallback={<Loading />}>
              <SellDevicePage />
            </Suspense>
          }
        />
        <Route path="contact" element={<ContactPage />} />
        <Route path="recherche" element={<SearchPage />} />
        <Route path="produit/:id" element={<ProductPage />} />
        <Route
          path="confidentialite"
          element={
            <Suspense fallback={<Loading />}>
              <PrivacyPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
