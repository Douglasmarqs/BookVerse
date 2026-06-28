// BookVerse — Serviço de Biblioteca pessoal
//
// Cada item de biblioteca vive em users/{uid}/books/{bookId}. A leitura
// usa onSnapshot (tempo real) para que, se o usuário abrir o BookVerse
// em outro dispositivo, veja o mesmo estado imediatamente — exigência
// do módulo "Minha Conta" (nenhuma alteração fica só local).

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'

function booksRef(uid) {
  return collection(db, 'users', uid, 'books')
}

export function subscribeToLibrary(uid, onChange, onError) {
  const q = query(booksRef(uid), orderBy('updatedAt', 'desc'))
  return onSnapshot(
    q,
    (snapshot) => {
      const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      onChange(books)
    },
    onError
  )
}

export async function addBook(uid, { title, author, totalPages }) {
  return addDoc(booksRef(uid), {
    title: title.trim(),
    author: author.trim(),
    totalPages: Number(totalPages) || 0,
    currentPage: 0,
    status: 'quero_ler',
    startedAt: null,
    finishedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateProgress(uid, bookId, currentPage, totalPages) {
  const safePage =
    totalPages > 0
      ? Math.max(0, Math.min(Number(currentPage) || 0, totalPages))
      : Math.max(0, Number(currentPage) || 0)

  const isFirstProgress = safePage > 0
  const isFinished = totalPages > 0 && safePage >= totalPages

  const payload = {
    currentPage: safePage,
    updatedAt: serverTimestamp(),
  }

  if (isFinished) {
    payload.status = 'concluido'
    payload.finishedAt = serverTimestamp()
  } else if (isFirstProgress) {
    payload.status = 'lendo'
  }

  return updateDoc(doc(db, 'users', uid, 'books', bookId), payload)
}

export async function markAsFinished(uid, bookId, totalPages) {
  return updateDoc(doc(db, 'users', uid, 'books', bookId), {
    status: 'concluido',
    currentPage: totalPages || 0,
    finishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function removeBook(uid, bookId) {
  return deleteDoc(doc(db, 'users', uid, 'books', bookId))
}
