// BookVerse — AppShell
//
// Header + barra de navegação inferior compartilhados entre as telas
// logadas que fazem parte da navegação principal (Dashboard, Biblioteca,
// e futuramente Lumi/Social/Perfil). Telas de detalhe (ex: Livro) não
// usam o AppShell — usam cabeçalho próprio com botão de voltar.

import { useLocation, useNavigate } from 'react-router-dom'
import { BookVerseLogo } from './BookVerseLogo'

const TABS = [
  { key: 'home', label: 'Início', path: '/dashboard' },
  { key: 'library', label: 'Biblioteca', path: '/biblioteca' },
  { key: 'lumi', label: 'Lumi', path: null },
  { key: 'social', label: 'Social', path: null },
  { key: 'profile', label: 'Perfil', path: null },
]

export function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="bv-screen">
      <header style={{ padding: '20px 20px 0' }}>
        <BookVerseLogo />
      </header>

      <main style={{ flex: 1 }}>{children}</main>

      <nav className="bv-tabbar">
        {TABS.map((tab) => {
          const isActive = Boolean(tab.path) && location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.key}
              className={`bv-tabbar-item ${isActive ? 'bv-tabbar-item--active' : ''}`}
              onClick={() => tab.path && navigate(tab.path)}
              style={!tab.path ? { opacity: 0.4, cursor: 'default' } : undefined}
              aria-disabled={!tab.path}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
