// BookVerse — Dashboard
//
// Primeira versão real (Documento 18). Mostra:
// - Card da Lumi com a mensagem contextual do momento (ver lumiService.js
//   para o que isso realmente é hoje: regras simples, não IA).
// - Sequência de leitura (streak), com a regra: se a última leitura não
//   foi hoje nem ontem, o streak exibido é 0 mesmo que o valor salvo
//   ainda não tenha sido "zerado" no banco (isso só vai acontecer de
//   verdade quando a leitura recomeçar — sem Cloud Function ainda).
// - Páginas lidas hoje vs. a meta diária definida em Configurações.
// - Livros com status "lendo", como atalho para continuar.

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReadingStats } from '../hooks/useReadingStats'
import { getLumiMessage } from '../services/lumiService'
import { AppShell } from '../components/AppShell'
import { BookCard } from '../components/BookCard'
import { ProgressBar } from '../components/ProgressBar'
import { LumiAvatar } from '../components/LumiAvatar'
import { Button } from '../components/Button'

export default function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { stats, dailyGoal, todayPages, books, readingNow, streak } = useReadingStats()

  const firstName = currentUser?.displayName?.split(' ')[0] || 'leitor'
  const lumiMessage = getLumiMessage({
    streak,
    todayPages,
    dailyGoal,
    readingNow,
    hasAnyBook: books.length > 0,
  })

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ marginBottom: 4 }}>
          Olá, {firstName} 👋
        </h1>
        <p className="bv-text-muted" style={{ marginBottom: 20 }}>
          {todayPages > 0
            ? `Você já leu ${todayPages} página${todayPages === 1 ? '' : 's'} hoje.`
            : 'Ainda não registrou leitura hoje.'}
        </p>

        <button className="bv-lumi-card" onClick={() => navigate('/lumi')}>
          <LumiAvatar size={40} mood={lumiMessage.mood} />
          <span className="bv-lumi-card-text">{lumiMessage.text}</span>
        </button>

        <div className="bv-stats-grid" style={{ marginTop: 20 }}>
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

        <div className="bv-card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="bv-title" style={{ fontSize: '1rem' }}>
              Meta diária
            </span>
            <span className="bv-text-muted">
              {todayPages} / {dailyGoal} páginas
            </span>
          </div>
          <ProgressBar current={todayPages} total={dailyGoal} />
        </div>

        <h2 className="bv-title" style={{ fontSize: '1rem', marginTop: 28, marginBottom: 12 }}>
          Continue lendo
        </h2>

        {readingNow.length === 0 ? (
          <div className="bv-empty-state" style={{ padding: 'var(--space-5) 0' }}>
            <p className="bv-text-muted">Nenhum livro em andamento agora.</p>
            <Button
              variant="ghost-on-paper"
              onClick={() => navigate('/biblioteca')}
              style={{ marginTop: 12 }}
            >
              Ir para a Biblioteca
            </Button>
          </div>
        ) : (
          <div className="bv-list">
            {readingNow.slice(0, 3).map((book) => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/biblioteca/${book.id}`)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
