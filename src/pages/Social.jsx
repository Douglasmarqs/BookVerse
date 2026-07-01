// BookVerse — Social (hub)
//
// Ponto de entrada da aba "Social". Por enquanto reúne Amigos e Ranking
// entre amigos — Feed, Clube do Livro, Mensagens e Comentários ainda não
// foram construídos (ver relatório de status do projeto).

import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

const ITEMS = [
  {
    path: '/amigos',
    title: 'Amigos',
    description: 'Encontre pessoas, envie e aceite pedidos de amizade.',
  },
  {
    path: '/ranking',
    title: 'Ranking',
    description: 'Veja como sua leitura se compara com a dos seus amigos.',
  },
]

export default function Social() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ marginBottom: 20 }}>
          Social
        </h1>

        <div className="bv-list">
          {ITEMS.map((item) => (
            <button key={item.path} className="bv-social-hub-card" onClick={() => navigate(item.path)}>
              <span className="bv-title" style={{ fontSize: '1rem' }}>
                {item.title}
              </span>
              <span className="bv-text-muted">{item.description}</span>
            </button>
          ))}
        </div>

        <p className="bv-text-muted" style={{ marginTop: 24, fontSize: '0.8rem' }}>
          Feed, Clube do Livro e Mensagens ainda estão em construção.
        </p>
      </div>
    </AppShell>
  )
}
