// BookVerse — Serviço de Amizades (Documento 15 — Sistema Social)
//
// Modelo de dados:
//   users/{uid}/friends/{friendUid}           — amizade confirmada
//   users/{uid}/friendRequests/{fromUid}       — pedido pendente recebido
//
// Quando um pedido é aceito, o cliente só escreve no PRÓPRIO lado
// (cria users/{meu}/friends/{outro} e apaga o pedido). A cópia espelhada
// do outro lado (users/{outro}/friends/{meu}) é feita por uma Cloud
// Function ("onFriendAdded", ver /functions/index.js) — o cliente não tem
// permissão de escrever direto na subcoleção de outra pessoa, então essa
// função é quem garante que a amizade apareça nos dois perfis. O mesmo
// vale para desfazer amizade ("onFriendRemoved").
//
// Por que não dá pra fazer dos dois lados direto pelo cliente: as regras
// do Firestore só deixam cada usuário escrever na própria subcoleção
// "friends" — exatamente para impedir que alguém adicione amizades falsas
// na conta de outra pessoa.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

// ---------- Busca de pessoas ----------

// Busca por prefixo do nome (case-insensitive via campo "nameLower").
// Limitação conhecida: só encontra pelo INÍCIO do nome (ex: "ana" acha
// "Ana Clara", mas não acha "Clara" buscando por "clara") — busca de
// texto completo exigiria um serviço externo (Algolia/Typesense), fora do
// escopo desta versão.
export async function searchUsers(queryText, currentUid) {
  const trimmed = queryText.trim().toLowerCase()
  if (trimmed.length < 2) return []

  const usersRef = collection(db, 'users')
  const q = query(
    usersRef,
    orderBy('nameLower'),
    where('nameLower', '>=', trimmed),
    where('nameLower', '<=', trimmed + '\uf8ff'),
    limit(15)
  )

  const snapshot = await getDocs(q)

  return snapshot.docs
    .map((d) => ({ uid: d.id, ...d.data() }))
    .filter((u) => u.uid !== currentUid)
}

// ---------- Status de amizade entre dois usuários ----------

// Lê os 3 documentos possíveis para descobrir o estado atual entre "me" e
// "other": já são amigos, eu enviei um pedido, ele me enviou um pedido, ou
// nenhum dos dois (estranhos).
export async function getFriendshipStatus(myUid, otherUid) {
  const [friendSnap, sentSnap, receivedSnap] = await Promise.all([
    getDoc(doc(db, 'users', myUid, 'friends', otherUid)),
    getDoc(doc(db, 'users', otherUid, 'friendRequests', myUid)),
    getDoc(doc(db, 'users', myUid, 'friendRequests', otherUid)),
  ])

  if (friendSnap.exists()) return 'friends'
  if (sentSnap.exists()) return 'request_sent'
  if (receivedSnap.exists()) return 'request_received'
  return 'none'
}

export async function sendFriendRequest(fromUser, toUid) {
  const requestRef = doc(db, 'users', toUid, 'friendRequests', fromUser.uid)
  await setDoc(requestRef, {
    fromUid: fromUser.uid,
    fromName: fromUser.displayName || 'Leitor',
    fromPhotoURL: fromUser.photoURL || null,
    createdAt: serverTimestamp(),
  })
}

// Cancela um pedido que EU enviei (antes de ser aceito).
export async function cancelFriendRequest(myUid, toUid) {
  await deleteDoc(doc(db, 'users', toUid, 'friendRequests', myUid))
}

// Recusa um pedido que recebi.
export async function declineFriendRequest(myUid, fromUid) {
  await deleteDoc(doc(db, 'users', myUid, 'friendRequests', fromUid))
}

// Aceita um pedido recebido: cria a amizade do meu lado (guardando nome e
// foto de quem enviou, já disponíveis no próprio pedido) e apaga o
// pedido. A Cloud Function "onFriendAdded" cuida de espelhar a amizade no
// perfil do outro usuário, buscando MEUS dados para preencher do lado
// dele (ver /functions/index.js).
export async function acceptFriendRequest(myUid, request) {
  await setDoc(doc(db, 'users', myUid, 'friends', request.fromUid), {
    since: serverTimestamp(),
    name: request.fromName || null,
    photoURL: request.fromPhotoURL || null,
  })
  await deleteDoc(doc(db, 'users', myUid, 'friendRequests', request.fromUid))
}

// Desfaz uma amizade do meu lado — a Cloud Function "onFriendRemoved"
// espelha a remoção no perfil do outro usuário.
export async function removeFriend(myUid, friendUid) {
  await deleteDoc(doc(db, 'users', myUid, 'friends', friendUid))
}

// ---------- Listas em tempo real ----------

export function subscribeToFriends(uid, onChange) {
  const q = query(collection(db, 'users', uid, 'friends'), orderBy('since', 'desc'))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  })
}

export function subscribeToIncomingRequests(uid, onChange) {
  const q = query(collection(db, 'users', uid, 'friendRequests'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    onChange(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  })
}
