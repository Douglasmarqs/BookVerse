// BookVerse — Prompt de instalação (PWA)
//
// O navegador dispara o evento "beforeinstallprompt" quando entende que o
// app é instalável (manifest válido + service worker registrado + HTTPS,
// exceto em localhost). Por padrão o Chrome mostra sua própria mini-barra;
// aqui interceptamos para mostrar um cartão com a identidade do BookVerse
// e decidir quando exibir (não insistir se o usuário já dispensou).
//
// iOS Safari não dispara esse evento (Apple não suporta a API) — para
// iOS, a instalação só acontece via "Compartilhar -> Adicionar à Tela de
// Início", então o card mostra essa instrução em vez do botão nativo.

import { useEffect, useState } from 'react'
import { Button } from './Button'

const DISMISSED_KEY = 'bookverse_install_dismissed'

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return

    function handleBeforeInstallPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // iOS não dispara beforeinstallprompt: mostramos a dica manual depois
    // de um pequeno atraso, para não competir com a tela de splash/login.
    let iosTimer
    if (isIos()) {
      iosTimer = setTimeout(() => {
        setShowIosHint(true)
        setVisible(true)
      }, 4000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setVisible(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  if (!visible) return null

  return (
    <div className="bv-install-card" role="dialog" aria-label="Instalar BookVerse">
      <div>
        <p style={{ fontWeight: 600, marginBottom: 2 }}>Instale o BookVerse</p>
        <p className="bv-text-muted" style={{ fontSize: '0.8rem' }}>
          {showIosHint
            ? 'Toque em Compartilhar e depois em "Adicionar à Tela de Início".'
            : 'Acesso rápido direto da tela inicial, mesmo offline.'}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {!showIosHint && (
          <Button variant="primary" onClick={handleInstall} style={{ width: 'auto', padding: '8px 16px' }}>
            Instalar
          </Button>
        )}
        <button onClick={handleDismiss} className="bv-install-dismiss" aria-label="Fechar">
          ✕
        </button>
      </div>
    </div>
  )
}
