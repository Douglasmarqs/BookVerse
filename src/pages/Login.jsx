// BookVerse — Login
//
// Estados cobertos nesta primeira versão: campos vazios, e-mail
// inválido, senha incorreta, usuário inexistente, e erro genérico de
// rede/Firebase indisponível. Recuperação de senha fica para o
// Documento 19 — Perfil / Segurança (ainda não implementada aqui).

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/Field'
import { Button } from '../components/Button'
import { BookVerseLogo } from '../components/BookVerseLogo'

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
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

            {error && <p className="bv-error-text">{error}</p>}

            <Button type="submit" loading={loading}>
              Entrar
            </Button>
          </form>

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
