// BookVerse — Biblioteca
//
// Lista os livros do usuário (Firestore: users/{uid}/books), com filtro
// por status. Adicionar livro agora busca na Google Books API (Documento
// 12), com capa, autor e total de páginas preenchidos automaticamente.
// Cadastro manual continua disponível para livros que a API não encontre
// (ex: lançamentos muito recentes, edições independentes).

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscribeToLibrary, addBook } from '../services/libraryService'
import { searchBooks } from '../services/booksApiService'
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

const ERROR_MESSAGES = {
  network: 'Sem conexão com a internet. Verifique sua rede e tente de novo.',
  rate_limit: 'Muitas buscas em pouco tempo. Espere um instante e tente de novo.',
  api_error: 'Não foi possível buscar agora. Tente de novo em instantes.',
}

function AddBookModal({ uid, onClose }) {
  const [mode, setMode] = useState('search') // 'search' | 'confirm' | 'manual'

  // --- estado da busca ---
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchState, setSearchState] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'
  const [searchError, setSearchError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearchState('idle')
      return
    }

    setSearchState('loading')
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const found = await searchBooks(trimmed)
        if (cancelled) return
        setResults(found)
        setSearchState('done')
      } catch (err) {
        if (cancelled) return
        setSearchError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.api_error)
        setSearchState('error')
      }
    }, 500) // debounce — evita uma requisição por tecla digitada

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  function handleSelectResult(book) {
    setSelected(book)
    setMode('confirm')
  }

  return (
    <Modal onClose={onClose}>
      {mode === 'search' && (
        <>
          <h2 className="bv-title" style={{ marginBottom: 16 }}>
            Adicionar livro
          </h2>
          <Field
            id="bookSearch"
            label="Buscar por título ou autor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Ex: Dom Casmurro"
          />

          {searchState === 'loading' && <p className="bv-text-muted">Buscando…</p>}
          {searchState === 'error' && <p className="bv-error-text">{searchError}</p>}
          {searchState === 'done' && results.length === 0 && (
            <p className="bv-text-muted">Nenhum resultado para "{query.trim()}".</p>
          )}

          {results.length > 0 && (
            <div className="bv-search-results">
              {results.map((book) => (
                <button
                  key={book.id}
                  className="bv-search-result"
                  onClick={() => handleSelectResult(book)}
                >
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="" className="bv-search-result-cover" />
                  ) : (
                    <span className="bv-search-result-cover bv-search-result-cover--placeholder">
                      {book.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="bv-search-result-info">
                    <span className="bv-search-result-title">{book.title}</span>
                    <span className="bv-text-muted">{book.author}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            className="bv-link-button"
            onClick={() => {
              setSelected({ title: query.trim(), author: '', totalPages: '' })
              setMode('manual')
            }}
          >
            Não encontrou? Adicionar manualmente
          </button>
        </>
      )}

      {mode === 'confirm' && selected && (
        <ConfirmStep
          uid={uid}
          book={selected}
          onBack={() => setMode('search')}
          onDone={onClose}
        />
      )}

      {mode === 'manual' && (
        <ManualForm
          uid={uid}
          initialTitle={selected?.title || ''}
          onBack={() => setMode('search')}
          onDone={onClose}
        />
      )}
    </Modal>
  )
}

function ConfirmStep({ uid, book, onBack, onDone }) {
  const [totalPages, setTotalPages] = useState(String(book.totalPages || ''))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await addBook(uid, {
        title: book.title,
        author: book.author,
        totalPages,
        coverUrl: book.coverUrl,
        description: book.description,
        categories: book.categories,
        googleBooksId: book.googleBooksId,
        openLibraryId: book.openLibraryId,
      })
      onDone()
    } catch (err) {
      setError('Não foi possível salvar agora. Tente de novo.')
      setSaving(false)
    }
  }

  return (
    <>
      <button className="bv-back-button" onClick={onBack} style={{ marginBottom: 12 }} aria-label="Voltar">
        ←
      </button>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt="" className="bv-confirm-cover" />
        ) : (
          <span className="bv-confirm-cover bv-confirm-cover--placeholder">
            {book.title.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="bv-title" style={{ fontSize: '1.05rem' }}>
            {book.title}
          </p>
          <p className="bv-text-muted">{book.author}</p>
        </div>
      </div>

      <form onSubmit={handleAdd} noValidate>
        <Field
          id="confirmPages"
          label="Total de páginas"
          type="number"
          min="0"
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
        />
        {error && <p className="bv-error-text">{error}</p>}
        <Button type="submit" loading={saving}>
          Adicionar à biblioteca
        </Button>
      </form>
    </>
  )
}

function ManualForm({ uid, initialTitle, onBack, onDone }) {
  const [title, setTitle] = useState(initialTitle)
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
      onDone()
    } catch (err) {
      setError('Não foi possível salvar agora. Tente de novo.')
      setSaving(false)
    }
  }

  return (
    <>
      <button className="bv-back-button" onClick={onBack} style={{ marginBottom: 12 }} aria-label="Voltar">
        ←
      </button>
      <h2 className="bv-title" style={{ marginBottom: 20 }}>
        Adicionar manualmente
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
    </>
  )
}
