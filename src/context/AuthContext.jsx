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

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

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

  async function signup({ name, email, password }) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })

    // Documento inicial do usuário no Firestore — base do módulo "Minha Conta"
    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email,
      username: null,
      bio: '',
      photoURL: null,
      favoriteGenres: [],
      favoriteAuthors: [],
      preferences: {
        theme: 'auto',
        language: 'pt-BR',
        notificationsEnabled: true,
        soundEnabled: true,
      },
      stats: {
        streakCount: 0,
        booksFinished: 0,
        pagesRead: 0,
      },
      createdAt: serverTimestamp(),
    })

    return credential.user
  }

  async function login({ email, password }) {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  }

  async function logout() {
    await signOut(auth)
  }

  const value = {
    currentUser,
    authLoading,
    signup,
    login,
    logout,
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
