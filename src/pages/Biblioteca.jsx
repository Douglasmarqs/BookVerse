// BookVerse — Biblioteca
//
// Lista os livros do usuário (Firestore: users/{uid}/books), com filtro
// por status e cadastro manual de livro. A integração com uma API de
// livros (busca por título/ISBN, capas reais) é o Documento 12 — APIs
// de Livros, ainda não implementada: por ora o cadastro é manual.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscribeToLibrary, addBook } from '../services/libraryService'
import { AppShell } from '../components/AppShell'
import { BookCard } from '../components/BookCard'
import { Modal } from '../components/Modal'
import { Field } from '../components/Field'
import { Button } from '../components/Button'

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'quero_ler', label: 'Quero ler' },
  { key: 'lendo', label: 'Lendo' },
  { key: 'concluido', label: 'Concluído' },
]

export default function Biblioteca() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = subscribeToLibrary(
      currentUser.uid,
      (data) => {
        setBooks(data)
        setLoading(false)
      },
      () => setLoading(false)
    )
    return unsubscribe
  }, [currentUser])

  const visibleBooks = filter === 'todos' ? books : books.filter((b) => b.status === filter)

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 8, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ margin: '16px 0' }}>
          Sua biblioteca
        </h1>

        <div className="bv-segmented">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`bv-chip ${filter === f.key ? 'bv-chip--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="bv-text-muted">Carregando sua estante…</p>
        ) : visibleBooks.length === 0 ? (
          <div className="bv-empty-state">
            <p className="bv-title">
              {filter === 'todos' ? 'Sua estante está vazia' : 'Nada por aqui ainda'}
            </p>
            <p className="bv-text-muted" style={{ marginTop: 8 }}>
              Toque no botão + para adicionar seu primeiro livro.
            </p>
          </div>
        ) : (
          <div className="bv-list">
            {visibleBooks.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => navigate(`/biblioteca/${book.id}`)} />
            ))}
          </div>
        )}
      </div>

      <button className="bv-fab" onClick={() => setShowModal(true)} aria-label="Adicionar livro">
        +
      </button>

      {showModal && <AddBookModal uid={currentUser.uid} onClose={() => setShowModal(false)} />}
    </AppShell>
  )
}

function AddBookModal({ uid, onClose }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !author.trim()) {
      setError('Preencha pelo menos o título e o autor.')
      return
    }
    setSaving(true)
    try {
      await addBook(uid, { title, author, totalPages })
      onClose()
    } catch (err) {
      setError('Não foi possível salvar agora. Tente de novo.')
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="bv-title" style={{ marginBottom: 20 }}>
        Adicionar livro
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <Field id="title" label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Field id="author" label="Autor" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <Field
          id="totalPages"
          label="Total de páginas (opcional)"
          type="number"
          min="0"
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
        />
        {error && <p className="bv-error-text">{error}</p>}
        <Button type="submit" loading={saving}>
          Salvar
        </Button>
      </form>
    </Modal>
  )
}
