// BookVerse — Card de livro (item da lista da Biblioteca)

import { ProgressBar } from './ProgressBar'

const STATUS_LABEL = {
  quero_ler: 'Quero ler',
  lendo: 'Lendo',
  concluido: 'Concluído',
}

export function BookCard({ book, onClick }) {
  const initial = book.title?.charAt(0)?.toUpperCase() || '?'

  return (
    <button className="bv-book-card" onClick={onClick}>
      {book.coverUrl ? (
        <img className="bv-book-cover bv-book-cover--image" src={book.coverUrl} alt="" aria-hidden="true" />
      ) : (
        <span className="bv-book-cover" aria-hidden="true">
          {initial}
        </span>
      )}
      <span className="bv-book-info">
        <span className="bv-book-title">{book.title}</span>
        <span className="bv-book-author">
          {book.author} · {STATUS_LABEL[book.status] || book.status}
        </span>
        {book.totalPages > 0 && <ProgressBar current={book.currentPage} total={book.totalPages} />}
      </span>
    </button>
  )
}
