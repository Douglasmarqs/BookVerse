// BookVerse — Campo de formulário base (label + input + erro)

export function Field({ label, error, ...rest }) {
  return (
    <div className="bv-field">
      <label htmlFor={rest.id}>{label}</label>
      <input className="bv-input" {...rest} />
      {error && <span className="bv-error-text">{error}</span>}
    </div>
  )
}
