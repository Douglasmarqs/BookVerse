// BookVerse — Detalhe do livro
//
// Base do Documento 21 — Leitura: atualizar página atual, marcar como
// concluído, remover o livro. Estados cobertos: carregando, livro
// removido em outro dispositivo (notFound), livro já concluído (oculta
// formulário de progresso).

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { updateProgress, markAsFinished, removeBook } from '../services/libraryService'
import { ProgressBar } from '../components/ProgressBar'
import { Button } from '../components/Button'
import { Field } from '../components/Field'

const STATUS_LABEL = {
  quero_ler: 'Quero ler',
  lendo: 'Lendo',
  concluido: 'Concluído',
}

export default function LivroDetalhe() {
  const { bookId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [pageInput, setPageInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const ref = doc(db, 'users', currentUser.uid, 'books', bookId)
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setNotFound(true)
        return
      }
      const data = { id: snap.id, ...snap.data() }
      setBook(data)
      setPageInput(String(data.currentPage ?? 0))
    })
    return unsubscribe
  }, [currentUser, bookId])

  async function handleUpdateProgress(e) {
    e.preventDefault()
    if (!book) return
    setSaving(true)
    await updateProgress(currentUser.uid, book.id, pageInput, book.totalPages)
    setSaving(false)
  }

  async function handleFinish() {
    if (!book) return
    setSaving(true)
    await markAsFinished(currentUser.uid, book.id, book.totalPages)
    setSaving(false)
  }

  async function handleRemove() {
    if (!book) return
    const confirmed = window.confirm('Remover este livro da sua biblioteca?')
    if (!confirmed) return
    await removeBook(currentUser.uid, book.id)
    navigate('/biblioteca', { replace: true })
  }

  if (notFound) {
    return (
      <div className="bv-screen">
        <div className="bv-center">
          <p className="bv-title">Esse livro não existe mais.</p>
          <Button
            variant="ghost-on-paper"
            onClick={() => navigate('/biblioteca')}
            style={{ marginTop: 16 }}
          >
            Voltar para a biblioteca
          </Button>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="bv-screen">
        <div className="bv-center">
          <p className="bv-text-muted">Carregando…</p>
        </div>
      </div>
    )
  }

  const isFinished = book.status === 'concluido'

  return (
    <div className="bv-screen">
      <div className="bv-page-header">
        <button className="bv-back-button" onClick={() => navigate('/biblioteca')} aria-label="Voltar">
          ←
        </button>
      </div>

      <div className="bv-container" style={{ paddingBottom: 60 }}>
        <h1 className="bv-display" style={{ fontSize: '1.75rem' }}>
          {book.title}
        </h1>
        <p className="bv-text-muted" style={{ marginTop: 4, marginBottom: 24 }}>
          {book.author} · {STATUS_LABEL[book.status] || book.status}
        </p>

        {book.totalPages > 0 && (
          <div style={{ marginBottom: 24 }}>
            <ProgressBar current={book.currentPage} total={book.totalPages} />
            <p className="bv-text-muted" style={{ marginTop: 8 }}>
              {book.currentPage} de {book.totalPages} páginas
            </p>
          </div>
        )}

        {!isFinished && (
          <form onSubmit={handleUpdateProgress} style={{ marginTop: 8 }}>
            <Field
              id="currentPage"
              label="Página atual"
              type="number"
              min="0"
              max={book.totalPages || undefined}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
            />
            <Button type="submit" loading={saving}>
              Salvar progresso
            </Button>
          </form>
        )}

        {!isFinished && (
          <Button variant="ghost-on-paper" onClick={handleFinish} style={{ marginTop: 12 }}>
            Marcar como concluído
          </Button>
        )}

        <button
          onClick={handleRemove}
          className="bv-error-text"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 24, fontWeight: 600 }}
        >
          Remover da biblioteca
        </button>
      </div>
    </div>
  )
}
