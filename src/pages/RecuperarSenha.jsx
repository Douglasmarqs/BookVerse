// BookVerse — Recuperar Senha
//
// Por design, não revela se o e-mail digitado existe ou não na base
// (ver resetPassword em AuthContext.jsx) — a mensagem de sucesso é a
// mesma independente disso, para não virar uma forma de descobrir quais
// e-mails têm conta no BookVerse.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/Field'
import { Button } from '../components/Button'
import { BookVerseLogo } from '../components/BookVerseLogo'

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Esse e-mail não parece válido.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente novamente.'
    default:
      return 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.'
  }
}

export default function RecuperarSenha() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Digite seu e-mail para continuar.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(mapFirebaseError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bv-screen">
      <div className="bv-center">
        <div className="bv-container">
          <div style={{ marginBottom: 32 }}>
            <BookVerseLogo />
          </div>

          {sent ? (
            <>
              <h1 className="bv-title" style={{ marginBottom: 12 }}>
                Verifique seu e-mail
              </h1>
              <p className="bv-text-muted" style={{ marginBottom: 24 }}>
                Se houver uma conta BookVerse com o e-mail <strong>{email.trim()}</strong>, você
                vai receber um link para redefinir sua senha em alguns instantes. Não esqueça de
                checar a caixa de spam.
              </p>
              <Link to="/login">
                <Button variant="ghost-on-paper">Voltar para o login</Button>
              </Link>
            </>
          ) : (
            <>
              <h1 className="bv-title" style={{ marginBottom: 8 }}>
                Esqueceu sua senha?
              </h1>
              <p className="bv-text-muted" style={{ marginBottom: 24 }}>
                Digite o e-mail da sua conta e enviaremos um link para você criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <Field
                  id="email"
                  label="E-mail"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {error && <p className="bv-error-text">{error}</p>}

                <Button type="submit" loading={loading}>
                  Enviar link de recuperação
                </Button>
              </form>

              <p className="bv-text-muted" style={{ marginTop: 24 }}>
                <Link to="/login" style={{ color: 'var(--color-lamp-strong)', fontWeight: 600 }}>
                  Voltar para o login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
