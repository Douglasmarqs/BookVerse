// BookVerse — Cadastro
//
// Validações: nome obrigatório, e-mail válido, senha mínima de 6
// caracteres (mínimo do Firebase Auth), confirmação de senha igual,
// e tratamento de e-mail já cadastrado.

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Field } from '../components/Field'
import { Button } from '../components/Button'
import { BookVerseLogo } from '../components/BookVerseLogo'
import { GoogleSignInButton } from '../components/GoogleSignInButton'

function mapFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Já existe uma conta com esse e-mail. Tente entrar.'
    case 'auth/invalid-email':
      return 'Esse e-mail não parece válido.'
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente novamente.'
    default:
      return 'Não foi possível criar sua conta agora. Tente novamente em instantes.'
  }
}

export default function Cadastro() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Conta pra gente como podemos te chamar.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await signup({ name: name.trim(), email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(mapFirebaseError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
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
            Sua estante começa aqui
          </h1>

          <form onSubmit={handleSubmit} noValidate>
            <Field id="name" label="Nome" type="text" value={name} onChange={(e) => setName(e.target.value)} />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field
              id="confirmPassword"
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && <p className="bv-error-text">{error}</p>}

            <Button type="submit" loading={loading}>
              Criar conta
            </Button>
          </form>

          <div className="bv-divider">
            <span>ou</span>
          </div>

          <GoogleSignInButton onClick={handleGoogleSignup} loading={googleLoading} />

          <p className="bv-text-muted" style={{ marginTop: 24 }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--color-lamp-strong)', fontWeight: 600 }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
