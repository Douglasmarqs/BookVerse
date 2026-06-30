// BookVerse — Mensagens da Lumi
//
// IMPORTANTE — leia antes de esperar "inteligência" daqui: isto NÃO é o
// sistema de IA do Documento 13. É um conjunto de regras simples (if/else)
// sobre dados que o app já coleta (streak, páginas hoje, meta, livro em
// andamento). A ideia é dar à Lumi uma primeira camada de personalidade
// e utilidade real, sem fingir uma IA que ainda não foi construída.
//
// Quando o motor de recomendação de verdade (Documento 13) existir, esta
// função pode ser substituída por uma chamada a ele — a assinatura
// (recebe um "contexto", devolve uma mensagem) já fica pronta para isso.

export function getLumiMessage({ streak, todayPages, dailyGoal, readingNow, hasAnyBook }) {
  if (!hasAnyBook) {
    return {
      text: 'Sua estante está vazia. Que tal adicionar o primeiro livro?',
      mood: 'default',
    }
  }

  if (todayPages >= dailyGoal && dailyGoal > 0) {
    return {
      text: `Meta de hoje batida! Você já leu ${todayPages} páginas. 🎉`,
      mood: 'happy',
    }
  }

  if (todayPages > 0 && dailyGoal > 0) {
    const remaining = dailyGoal - todayPages
    return {
      text: `Faltam ${remaining} página${remaining === 1 ? '' : 's'} para a sua meta de hoje.`,
      mood: 'default',
    }
  }

  if (streak > 0 && todayPages === 0) {
    return {
      text: `Sua sequência de ${streak} dia${streak === 1 ? '' : 's'} está esperando a leitura de hoje.`,
      mood: 'default',
    }
  }

  if (readingNow && readingNow.length > 0) {
    return {
      text: `Que tal continuar "${readingNow[0].title}"?`,
      mood: 'default',
    }
  }

  return {
    text: 'Pronta para começar a ler hoje?',
    mood: 'happy',
  }
}
