// BookVerse — Perfil público de outro usuário
//
// IMPORTANTE — decisão de privacidade desta versão: a biblioteca de
// qualquer usuário (users/{uid}/books) é legível por qualquer pessoa
// autenticada, igual a uma estante pública do Goodreads. Ainda não existe
// a opção "tornar minha biblioteca privada" (isso é parte do módulo
// Privacidade, dentro de Configurações — Documento 19, não construído
// nesta versão). Se isso for um problema, é a primeira coisa a endereçar
// antes de qualquer lançamento público real.

import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() }
}

// Mostra só os livros mais recentes (até 10) no perfil de outra pessoa —
// uma "prévia" da estante, não a biblioteca inteira.
export function subscribeToUserBooksPreview(uid, onChange) {
  const q = query(collection(db, 'users', uid, 'books'), orderBy('updatedAt', 'desc'), limit(10))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}
