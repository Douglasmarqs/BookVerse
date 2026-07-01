// BookVerse — Contexto de Autenticação
//
// Centraliza toda a lógica de auth (Firebase Auth) e a criação/leitura do
// perfil do usuário no Firestore (coleção "users"). Qualquer tela que
// precise saber quem está logado consome este contexto via useAuth().
//
// Campos do perfil criados no cadastro são um subconjunto inicial do que
// está especificado no módulo "Minha Conta" (Documento 19 — Perfil).
// Mais campos serão adicionados conforme as telas de edição de perfil
// forem desenvolvidas.
//
// Login com Google usa signInWithRedirect (não signInWithPopup). Motivo:
// popups têm comportamento instável em PWAs instaladas no iOS (Safari em
// modo standalone frequentemente bloqueia ou falha ao abrir popup) — o
// fluxo de redirecionamento funciona de forma consistente em todos os
// contextos (navegador normal, PWA instalada, Android, iOS).
//
// Login com Apple NÃO foi implementado: exige inscrição paga no Apple
// Developer Program (US$ 99/ano) para configurar "Sign in with Apple" —
// não faz sentido implementar um botão que não vai funcionar sem essa
// conta. Fica documentado aqui como decisão consciente, não esquecimento.

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)
const googleProvider = new GoogleAuthProvider()

// Cria o documento de perfil no Firestore só se ele ainda não existir —
// usado tanto no cadastro por e-mail quanto no primeiro login via Google
// (onde não existe uma etapa de "cadastro" separada).
async function ensureUserProfile(user, { name } = {}) {
  const userRef = doc(db, 'users', user.uid)
  const existing = await getDoc(userRef)
  if (existing.exists()) return

  const finalName = name || user.displayName || ''

  await setDoc(userRef, {
    name: finalName,
    nameLower: finalName.toLowerCase(), // usado na busca de pessoas (Documento 15)
    email: user.email,
    username: null,
    bio: '',
    photoURL: user.photoURL || null,
    favoriteGenres: [],
    favoriteAuthors: [],
    preferences: {
      theme: 'auto',
      language: 'pt-BR',
      notificationsEnabled: true,
      soundEnabled: true,
      dailyGoalPages: 20,
    },
    stats: {
      streakCount: 0,
      booksFinished: 0,
      pagesRead: 0,
    },
    createdAt: serverTimestamp(),
  })
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  // Completa o fluxo de login com Google após o redirecionamento de volta
  // ao app. Roda uma vez, na montagem do provider.
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          return ensureUserProfile(result.user)
        }
      })
      .catch(() => {
        // Falha no redirecionamento (ex: usuário cancelou) — silenciosa
        // aqui; a tela de Login trata erros do clique inicial separadamente.
      })
  }, [])

  // Self-heal: contas criadas antes do campo "nameLower" existir (usado na
  // busca de pessoas, Documento 15) recebem o campo automaticamente no
  // próximo login, sem precisar de migração manual no Console.
  useEffect(() => {
    if (!currentUser) return
    const userRef = doc(db, 'users', currentUser.uid)
    getDoc(userRef).then((snap) => {
      const data = snap.data()
      if (data && !data.nameLower && data.name) {
        updateDoc(userRef, { nameLower: data.name.toLowerCase() }).catch(() => {})
      }
    })
  }, [currentUser])

  async function signup({ name, email, password }) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    await ensureUserProfile(credential.user, { name })
    return credential.user
  }

  async function login({ email, password }) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function loginWithGoogle() {
    await signInWithRedirect(auth, googleProvider)
    // O app recarrega após o redirecionamento; o resultado é tratado no
    // useEffect de getRedirectResult acima.
  }

  async function logout() {
    await signOut(auth)
  }

  // Não revela se o e-mail existe ou não na base — isso evita que alguém
  // use o formulário de recuperação para descobrir quais e-mails têm
  // conta no BookVerse (account enumeration). Erros de formato de e-mail
  // ou de rede ainda são informados normalmente.
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (err) {
      if (err.code === 'auth/user-not-found') return // finge sucesso
      throw err
    }
  }

  const value = {
    currentUser,
    authLoading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um <AuthProvider>')
  }
  return context
}
