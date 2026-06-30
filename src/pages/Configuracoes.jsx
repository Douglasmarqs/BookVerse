// BookVerse — Configurações
//
// Primeira fatia do módulo "Minha Conta" (preferências). Tudo aqui é
// salvo em users/{uid}.preferences e sincroniza em tempo real entre
// dispositivos — nada fica só local, conforme exigido na especificação.
//
// O toggle de notificações por enquanto só guarda a preferência: o envio
// de push de verdade (Firebase Cloud Messaging) é o Documento 25, ainda
// não implementado.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import { Field } from '../components/Field'

const THEME_OPTIONS = [
  { key: 'light', label: 'Claro' },
  { key: 'dark', label: 'Escuro' },
  { key: 'auto', label: 'Automático' },
]

const DEFAULT_DAILY_GOAL = 20

export default function Configuracoes() {
  const { currentUser, logout } = useAuth()
  const { preference, setThemePreference } = useTheme()
  const navigate = useNavigate()

  const [dailyGoal, setDailyGoal] = useState(String(DEFAULT_DAILY_GOAL))
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalSaved, setGoalSaved] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const ref = doc(db, 'users', currentUser.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      const prefs = snap.data()?.preferences || {}
      setDailyGoal(String(prefs.dailyGoalPages || DEFAULT_DAILY_GOAL))
      setNotificationsEnabled(prefs.notificationsEnabled !== false)
    })
    return unsubscribe
  }, [currentUser])

  async function handleSaveGoal(e) {
    e.preventDefault()
    const value = Math.max(1, Number(dailyGoal) || DEFAULT_DAILY_GOAL)
    setSavingGoal(true)
    await updateDoc(doc(db, 'users', currentUser.uid), { 'preferences.dailyGoalPages': value })
    setSavingGoal(false)
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  async function handleToggleNotifications() {
    const next = !notificationsEnabled
    setNotificationsEnabled(next) // resposta visual imediata
    await updateDoc(doc(db, 'users', currentUser.uid), {
      'preferences.notificationsEnabled': next,
    })
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ marginBottom: 28 }}>
          Configurações
        </h1>

        <section style={{ marginBottom: 32 }}>
          <p className="bv-settings-label">Aparência</p>
          <div className="bv-segmented" style={{ marginBottom: 0 }}>
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`bv-chip ${preference === opt.key ? 'bv-chip--active' : ''}`}
                onClick={() => setThemePreference(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <p className="bv-settings-label">Meta diária de leitura</p>
          <form onSubmit={handleSaveGoal} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Field
                id="dailyGoal"
                label="Páginas por dia"
                type="number"
                min="1"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              loading={savingGoal}
              style={{ width: 'auto', padding: '12px 20px', marginTop: 26 }}
            >
              Salvar
            </Button>
          </form>
          {goalSaved && (
            <p className="bv-text-muted" style={{ marginTop: -8, color: 'var(--color-leaf)' }}>
              Meta atualizada.
            </p>
          )}
        </section>

        <section style={{ marginBottom: 32 }}>
          <p className="bv-settings-label">Notificações</p>
          <button className="bv-toggle-row" onClick={handleToggleNotifications}>
            <span>
              <span style={{ display: 'block', fontWeight: 600 }}>Lembretes e novidades</span>
              <span className="bv-text-muted" style={{ fontSize: '0.8rem' }}>
                Meta diária, sequência prestes a acabar, novidades do app.
              </span>
            </span>
            <span className={`bv-switch ${notificationsEnabled ? 'bv-switch--on' : ''}`} aria-hidden="true">
              <span className="bv-switch-knob" />
            </span>
          </button>
          <p className="bv-text-muted" style={{ marginTop: 8, fontSize: '0.75rem' }}>
            O envio de notificações push ainda está em desenvolvimento — sua
            preferência já fica salva para quando o sistema entrar no ar.
          </p>
        </section>

        <Button variant="ghost-on-paper" onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </AppShell>
  )
}
