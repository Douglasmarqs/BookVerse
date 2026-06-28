// BookVerse — Botão base
//
// variant: 'primary' | 'ghost' | 'ghost-on-paper'

export function Button({ children, variant = 'primary', loading = false, ...rest }) {
  const variantClass =
    variant === 'ghost'
      ? 'bv-button--ghost'
      : variant === 'ghost-on-paper'
        ? 'bv-button--ghost-on-paper'
        : 'bv-button--primary'

  return (
    <button className={`bv-button ${variantClass}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? 'Carregando…' : children}
    </button>
  )
}
