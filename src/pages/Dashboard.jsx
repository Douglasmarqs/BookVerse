// BookVerse — Dashboard
//
// Esta é uma versão placeholder: confirma que auth + Firestore + rotas
// protegidas estão funcionando de ponta a ponta. O conteúdo real do
// Dashboard (continuar leitura, meta do dia, Lumi, atividade dos
// amigos) é o Documento 18 — Dashboard, ainda não desenvolvido.

import { useAuth } from '../context/AuthContext'
import { BookVerseLogo } from '../components/BookVerseLogo'

const TABS = [
  { key: 'home', label: 'Início' },
  { key: 'library', label: 'Biblioteca' },
  { key: 'lumi', label: 'Lumi' },
  { key: 'social', label: 'Social' },
  { key: 'profile', label: 'Perfil' },
]

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'leitor'

  return (
    <div className="bv-screen">
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 20px 0',
        }}
      >
        <BookVerseLogo />
        <button
          onClick={logout}
          className="bv-text-muted"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Sair
        </button>
      </header>

      <main className="bv-center" style={{ flex: 1 }}>
        <div className="bv-container">
          <div className="bv-card">
            <h1 className="bv-title">Olá, {firstName} 👋</h1>
            <p className="bv-text-muted" style={{ marginTop: 8 }}>
              Sua conta está sincronizada com o Firestore. A partir daqui, cada módulo
              (Biblioteca, Leitura, Gamificação, Lumi…) será adicionado como uma seção
              independente, sem precisar reescrever o que já existe.
            </p>
          </div>
        </div>
      </main>

      <nav className="bv-tabbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`bv-tabbar-item ${tab.key === 'home' ? 'bv-tabbar-item--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
