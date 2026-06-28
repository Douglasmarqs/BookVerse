// BookVerse — Dashboard
//
// Conteúdo real do Dashboard (continuar leitura, meta do dia, Lumi,
// atividade dos amigos) é o Documento 18 — Dashboard, ainda não
// desenvolvido. Por ora, confirma que auth + Firestore + navegação
// entre módulos estão funcionando de ponta a ponta.

import { useAuth } from '../context/AuthContext'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'

export default function Dashboard() {
  const { currentUser, logout } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'leitor'

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 24, paddingBottom: 110 }}>
        <div className="bv-card">
          <h1 className="bv-title">Olá, {firstName} 👋</h1>
          <p className="bv-text-muted" style={{ marginTop: 8 }}>
            Sua conta está sincronizada com o Firestore. A Biblioteca já é o
            primeiro módulo de conteúdo real — toque na aba "Biblioteca" abaixo
            para adicionar seu primeiro livro.
          </p>
        </div>

        <Button
          variant="ghost-on-paper"
          onClick={logout}
          style={{ marginTop: 24 }}
        >
          Sair da conta
        </Button>
      </div>
    </AppShell>
  )
}
