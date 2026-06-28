// BookVerse — Rota Protegida
//
// Envolve telas que exigem usuário autenticado (ex: Dashboard).
// Enquanto o Firebase ainda está checando a sessão, mostra um loading
// simples em vez de "piscar" a tela de login antes de redirecionar
// um usuário que, na verdade, já está logado.

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="bv-screen bv-screen--ink">
        <div className="bv-center">
          <span className="bv-text-muted">Carregando…</span>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}
