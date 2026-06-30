// BookVerse — Aviso de atualização disponível
//
// Cobre o requisito de "atualização automática" do módulo PWA: quando o
// Vite/Workbox detecta uma nova versão publicada, este componente avisa o
// usuário e oferece recarregar para aplicar — sem isso, o usuário ficaria
// preso na versão antiga até fechar e reabrir o navegador manualmente.

import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="bv-update-toast" role="status">
      <span>Nova versão do BookVerse disponível.</span>
      <button onClick={() => updateServiceWorker(true)} className="bv-update-toast-button">
        Atualizar
      </button>
    </div>
  )
}
