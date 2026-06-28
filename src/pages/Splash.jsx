// BookVerse — Splash
//
// Fluxo (conforme Documento 05 — Fluxo de Navegação):
// Splash -> [primeira vez?] -> Onboarding -> Cadastro/Login -> Dashboard
// Splash -> [já viu onboarding e está logado] -> Dashboard
// Splash -> [já viu onboarding e não está logado] -> Login

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookVerseLogo } from '../components/BookVerseLogo'

const ONBOARDING_KEY = 'bookverse_onboarded'

export default function Splash() {
  const { currentUser, authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return

    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY) === 'true'

    const timer = setTimeout(() => {
      if (!hasOnboarded) {
        navigate('/onboarding', { replace: true })
      } else if (currentUser) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 700) // pequena pausa intencional — a splash é uma respiração, não um obstáculo

    return () => clearTimeout(timer)
  }, [authLoading, currentUser, navigate])

  return (
    <div className="bv-screen bv-screen--ink">
      <div className="bv-center">
        <BookVerseLogo size="lg" />
      </div>
    </div>
  )
}
