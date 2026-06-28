// BookVerse — Logo / elemento de assinatura
//
// A "fita de marcador de página" é o elemento visual recorrente do
// BookVerse: aparece junto ao nome do app, em indicadores de progresso
// e em itens de navegação ativos.

export function BookVerseLogo({ size = 'md' }) {
  const wordSize = size === 'lg' ? '2rem' : '1.5rem'

  return (
    <div className="bv-logo">
      <span className="bv-ribbon" aria-hidden="true" />
      <span className="bv-logo-word" style={{ fontSize: wordSize }}>
        BookVerse
      </span>
    </div>
  )
}
