// BookVerse — Lumi
//
// Primeira versão real da aba Lumi. Mostra a mensagem contextual (mesma
// lógica usada no Dashboard) em destaque, e é honesta sobre o que ainda
// não existe: não há chat, não há recomendação por IA de verdade — isso
// é o Documento 13, que depende de um backend próprio (Cloud Functions +
// possivelmente uma API de linguagem) ainda não construído.

import { useReadingStats } from '../hooks/useReadingStats'
import { getLumiMessage } from '../services/lumiService'
import { AppShell } from '../components/AppShell'
import { LumiAvatar } from '../components/LumiAvatar'

export default function Lumi() {
  const { dailyGoal, todayPages, books, readingNow, streak } = useReadingStats()

  const message = getLumiMessage({
    streak,
    todayPages,
    dailyGoal,
    readingNow,
    hasAnyBook: books.length > 0,
  })

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 32, paddingBottom: 110, textAlign: 'center' }}>
        <LumiAvatar size={96} mood={message.mood} />
        <p className="bv-title" style={{ marginTop: 20, marginBottom: 8 }}>
          Lumi
        </p>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.5, marginBottom: 32 }}>{message.text}</p>

        <div className="bv-card" style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Sobre a Lumi (por enquanto)</p>
          <p className="bv-text-muted" style={{ lineHeight: 1.6 }}>
            Hoje a Lumi observa sua sequência de leitura e sua meta diária para te
            dar um empurrãozinho na hora certa. Conversa por chat e recomendações
            de livros baseadas em IA ainda estão em construção — quando
            estiverem prontas, é aqui que vão aparecer.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
