// BookVerse — Login
//
// Estados cobertos: campos vazios, e-mail inválido, senha incorreta,
// usuário inexistente, erro genérico de rede/Firebase indisponível, e
// falha no login com Google. Recuperação de senha tem tela própria
// (/recuperar-senha).

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/Field'
import { Button } from '../components/Button'
import { BookVerseLogo } from '../components/BookVerseLogo'
import { GoogleSignInButton } from '../components/GoogleSignInButton'

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Esse e-mail não parece válido.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.'
    case 'auth/wrong-password':
      return 'Senha incorreta.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Espere um pouco e tente de novo.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente novamente.'
    default:
      return 'Não foi possível entrar agora. Tente novamente em instantes.'
  }
}

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Preencha e-mail e senha para continuar.')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(mapFirebaseError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      // A página é redirecionada para o Google e volta sozinha — não há
      // mais nada a fazer aqui depois desta chamada.
    } catch (err) {
      setError('Não foi possível conectar com o Google agora. Tente de novo.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="bv-screen">
      <div className="bv-center">
        <div className="bv-container">
          <div style={{ marginBottom: 32 }}>
            <BookVerseLogo />
          </div>

          <h1 className="bv-title" style={{ marginBottom: 24 }}>
            Bom te ver de novo
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <Field
              id="email"
              label="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              id="password"
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <p style={{ textAlign: 'right', marginTop: -8, marginBottom: 20 }}>
              <Link
                to="/recuperar-senha"
                className="bv-text-muted"
                style={{ fontSize: '0.85rem', fontWeight: 600 }}
              >
                Esqueceu sua senha?
              </Link>
            </p>

            {error && <p className="bv-error-text">{error}</p>}

            <Button type="submit" loading={loading}>
              Entrar
            </Button>
          </form>

          <div className="bv-divider">
            <span>ou</span>
          </div>

          <GoogleSignInButton onClick={handleGoogleLogin} loading={googleLoading} />

          <p className="bv-text-muted" style={{ marginTop: 24 }}>
            Ainda não tem conta?{' '}
            <Link to="/cadastro" style={{ color: 'var(--color-lamp-strong)', fontWeight: 600 }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
