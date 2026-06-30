// BookVerse — Botão "Continuar com Google"

import { GoogleIcon } from './GoogleIcon'

export function GoogleSignInButton({ onClick, loading }) {
  return (
    <button type="button" className="bv-google-button" onClick={onClick} disabled={loading}>
      <GoogleIcon />
      <span>{loading ? 'Conectando…' : 'Continuar com Google'}</span>
    </button>
  )
}
