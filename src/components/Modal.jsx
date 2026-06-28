// BookVerse — Modal (bottom sheet)
//
// Padrão modal-based para CRUDs simples (cadastro de livro, e futuramente
// outras entidades), em vez de navegar para uma tela cheia.

export function Modal({ onClose, children }) {
  return (
    <div className="bv-modal-overlay" onClick={onClose}>
      <div className="bv-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
