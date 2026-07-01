// BookVerse — Perfil (próprio)
//
// Versão de leitura — edição de bio/foto/gêneros favoritos ainda não foi
// construída (isso é a tela "Editar Perfil", Documento 19, separada
// desta). Por ora mostra os dados já existentes (nome, stats) e o link
// para Configurações, onde as preferências reais já são editáveis.

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReadingStats } from '../hooks/useReadingStats'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'

export default function Perfil() {
  const { currentUser } = useAuth()
  const { stats, streak } = useReadingStats()
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 24, paddingBottom: 110, textAlign: 'center' }}>
        <Avatar name={currentUser?.displayName} photoURL={currentUser?.photoURL} size={88} />
        <h1 className="bv-title" style={{ marginTop: 16, marginBottom: 4 }}>
          {currentUser?.displayName || 'Leitor'}
        </h1>
        <p className="bv-text-muted" style={{ marginBottom: 24 }}>
          {currentUser?.email}
        </p>

        <div className="bv-stats-grid">
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{streak}</span>
            <span className="bv-stat-label">{streak === 1 ? 'dia seguido' : 'dias seguidos'}</span>
          </div>
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{stats?.pagesRead || 0}</span>
            <span className="bv-stat-label">páginas no total</span>
          </div>
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{stats?.booksFinished || 0}</span>
            <span className="bv-stat-label">livros concluídos</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
          <Button variant="ghost-on-paper" onClick={() => navigate('/amigos')}>
            Ver amigos
          </Button>
          <Button variant="ghost-on-paper" onClick={() => navigate('/configuracoes')}>
            Configurações
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
