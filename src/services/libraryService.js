// BookVerse — Serviço de Biblioteca pessoal
//
// Cada item de biblioteca vive em users/{uid}/books/{bookId}, sincronizado
// em tempo real (onSnapshot).
//
// IMPORTANTE — isso mudou: o cliente NÃO escreve mais em stats.pagesRead,
// stats.streakCount, stats.booksFinished nem em readingLog/{data}. Essas
// escritas agora são responsabilidade exclusiva da Cloud Function
// "onBookProgressUpdate" (ver /functions/index.js), disparada sempre que
// currentPage muda em um livro. O cliente só atualiza o próprio livro
// (currentPage, status) — a Cloud Function observa essa mudança e calcula
// o resto do lado do servidor.
//
// Por quê: antes, qualquer pessoa com acesso ao DevTools do navegador
// podia escrever diretamente no Firestore via SDK e forjar um streak ou
// um total de páginas lidas. Mover esse cálculo para o servidor (que usa
// o Admin SDK e ignora as regras de segurança do cliente) fecha essa
// brecha. As regras do Firestore (firestore.rules) agora bloqueiam
// explicitamente escritas do cliente no campo "stats" e na coleção
// "readingLog" — só a Cloud Function consegue escrever ali.
//
// Efeito colateral aceitável: como a Cloud Function roda de forma
// assíncrona (geralmente menos de 1 segundo), pode haver um pequeno atraso
// entre salvar o progresso e ver o streak/páginas atualizados no
// Dashboard. As telas já usam onSnapshot, então atualizam sozinhas assim
// que a função terminar — não é necessário recarregar a página.

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

function formatDateId(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function getTodayId() {
  return formatDateId(new Date())
}

export function getYesterdayId() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDateId(d)
}

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

export async function addBook(uid, { title, author, totalPages, coverUrl = null, description = '', categories = [], googleBooksId = null, openLibraryId = null }) {
  return addDoc(booksRef(uid), {
    title: title.trim(),
    author: author.trim(),
    totalPages: Number(totalPages) || 0,
    currentPage: 0,
    status: 'quero_ler',
    coverUrl,
    description,
    categories,
    googleBooksId,
    openLibraryId,
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

  // A Cloud Function "onBookProgressUpdate" cuida do resto a partir daqui.
  await updateDoc(doc(db, 'users', uid, 'books', bookId), payload)
}

export async function markAsFinished(uid, bookId, totalPages) {
  await updateDoc(doc(db, 'users', uid, 'books', bookId), {
    status: 'concluido',
    currentPage: totalPages || 0,
    finishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function removeBook(uid, bookId) {
  return deleteDoc(doc(db, 'users', uid, 'books', bookId))
}
