// BookVerse — Contexto de Tema
//
// O tema escolhido é salvo em users/{uid}.preferences.theme ('light' |
// 'dark' | 'auto'), exigência do módulo "Minha Conta": preferências devem
// acompanhar o usuário em qualquer dispositivo, não ficar só no aparelho.
//
// Implementação: quando o tema resolvido é 'dark', aplicamos a classe
// "bv-theme-dark" no <body>. Os tokens de cor (tokens.css) reagem a essa
// classe sobrescrevendo as variáveis --color-paper*, então qualquer
// componente que já usa essas variáveis (cards, inputs, chips, etc.)
// escurece automaticamente, sem precisar de CSS duplicado por componente.

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

function resolveTheme(preference, systemPrefersDark) {
  if (preference === 'dark') return 'dark'
  if (preference === 'light') return 'light'
  return systemPrefersDark ? 'dark' : 'light' // 'auto' (ou ainda não definido)
}

export function ThemeProvider({ children }) {
  const { currentUser } = useAuth()
  const [preference, setPreference] = useState('auto')
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  )

  // Acompanha mudança de tema do sistema operacional em tempo real,
  // relevante quando a preferência do usuário é 'auto'.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange(e) {
      setSystemPrefersDark(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Sincroniza com a preferência salva no Firestore.
  useEffect(() => {
    if (!currentUser) {
      setPreference('auto')
      return
    }
    const ref = doc(db, 'users', currentUser.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      setPreference(snap.data()?.preferences?.theme || 'auto')
    })
    return unsubscribe
  }, [currentUser])

  const resolved = resolveTheme(preference, systemPrefersDark)

  useEffect(() => {
    document.body.classList.toggle('bv-theme-dark', resolved === 'dark')
  }, [resolved])

  async function setThemePreference(value) {
    setPreference(value) // resposta visual imediata, sem esperar a rede
    if (currentUser) {
      await updateDoc(doc(db, 'users', currentUser.uid), { 'preferences.theme': value })
    }
  }

  return (
    <ThemeContext.Provider value={{ preference, resolved, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de um <ThemeProvider>')
  }
  return context
}
