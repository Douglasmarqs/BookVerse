// BookVerse — Serviço de busca de livros (Google Books + Open Library)
//
// Documento 12 — APIs de Livros. Estratégia: Google Books é a fonte
// principal (metadados mais ricos — sinopse, categorias, capas de boa
// qualidade). Open Library entra como COMPLEMENTO em dois casos:
//
//   1. Google Books retornou poucos resultados (< 8) — buscamos na Open
//      Library também e mesclamos, evitando duplicados, para aumentar a
//      variedade de títulos disponíveis.
//   2. Google Books falhou (rede instável, limite de requisições) — Open
//      Library assume sozinha, então a busca ainda funciona.
//
// Nenhuma das duas exige chave de API para buscas básicas.
//
// Limitação conhecida: a Open Library não devolve sinopse no endpoint de
// busca (só no endpoint de obra individual, que exigiria uma requisição
// extra por livro) — por isso resultados vindos dela não têm descrição.

const GOOGLE_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_COVERS_URL = 'https://covers.openlibrary.org/b/id'
const REQUEST_TIMEOUT_MS = 7000
const MIN_RESULTS_BEFORE_COMPLEMENTING = 8

function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '').trim()
}

// Reduz um título a uma chave comparável, para detectar duplicados entre
// as duas fontes (ex: "Dom Casmurro" vindo das duas APIs não deve
// aparecer duas vezes na lista de resultados).
function normalizeKey(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9]/g, '')
}

// ---------- Google Books ----------

function buildGoogleSearchUrl(query) {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
  const params = new URLSearchParams({
    q: query,
    maxResults: '12',
    printType: 'books',
    langRestrict: 'pt',
  })
  if (apiKey) params.set('key', apiKey)
  return `${GOOGLE_BASE_URL}?${params.toString()}`
}

function normalizeGoogleVolume(item) {
  const info = item.volumeInfo || {}
  const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null

  return {
    id: `google:${item.id}`,
    source: 'google',
    googleBooksId: item.id,
    openLibraryId: null,
    title: info.title || 'Sem título',
    author: (info.authors && info.authors.join(', ')) || 'Autor desconhecido',
    totalPages: info.pageCount || 0,
    coverUrl: thumbnail ? thumbnail.replace('http://', 'https://') : null,
    description: info.description ? stripHtml(info.description) : '',
    categories: info.categories || [],
    publishedDate: info.publishedDate || null,
  }
}

async function searchGoogleBooks(query) {
  let response
  try {
    response = await fetchWithTimeout(buildGoogleSearchUrl(query))
  } catch (err) {
    throw new Error('network')
  }

  if (!response.ok) {
    if (response.status === 429) throw new Error('rate_limit')
    throw new Error('api_error')
  }

  const data = await response.json()
  if (!data.items) return []
  return data.items.map(normalizeGoogleVolume)
}

// ---------- Open Library ----------

function buildOpenLibrarySearchUrl(query) {
  const params = new URLSearchParams({
    q: query,
    limit: '12',
    language: 'por',
    fields: 'key,title,author_name,cover_i,number_of_pages_median,first_publish_year,subject',
  })
  return `${OPEN_LIBRARY_BASE_URL}?${params.toString()}`
}

function normalizeOpenLibraryDoc(doc) {
  return {
    id: `openlibrary:${doc.key}`,
    source: 'openlibrary',
    googleBooksId: null,
    openLibraryId: doc.key,
    title: doc.title || 'Sem título',
    author: (doc.author_name && doc.author_name.join(', ')) || 'Autor desconhecido',
    totalPages: doc.number_of_pages_median || 0,
    coverUrl: doc.cover_i ? `${OPEN_LIBRARY_COVERS_URL}/${doc.cover_i}-M.jpg` : null,
    description: '', // não disponível no endpoint de busca
    categories: doc.subject ? doc.subject.slice(0, 3) : [],
    publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : null,
  }
}

async function searchOpenLibrary(query) {
  let response
  try {
    response = await fetchWithTimeout(buildOpenLibrarySearchUrl(query))
  } catch (err) {
    throw new Error('network')
  }

  if (!response.ok) throw new Error('api_error')

  const data = await response.json()
  if (!data.docs) return []
  return data.docs.map(normalizeOpenLibraryDoc).filter((b) => b.title !== 'Sem título')
}

// ---------- Busca combinada ----------

export async function searchBooks(query) {
  const trimmed = query.trim()
  if (!trimmed) return []

  let googleResults = []
  let googleError = null

  try {
    googleResults = await searchGoogleBooks(trimmed)
  } catch (err) {
    googleError = err
  }

  // Google trouxe bastante coisa — não precisa complementar.
  if (googleResults.length >= MIN_RESULTS_BEFORE_COMPLEMENTING) {
    return googleResults
  }

  let openLibraryResults = []
  try {
    openLibraryResults = await searchOpenLibrary(trimmed)
  } catch (err) {
    // Se o Google já tinha funcionado, uma falha da Open Library não é
    // crítica — apenas seguimos só com o que o Google trouxe.
  }

  // Mescla evitando títulos duplicados entre as duas fontes.
  const seenKeys = new Set(googleResults.map((b) => normalizeKey(b.title)))
  const merged = [...googleResults]
  for (const book of openLibraryResults) {
    const key = normalizeKey(book.title)
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(book)
    }
  }

  // Só propaga erro se as duas fontes falharam de verdade (rede/limite) —
  // "zero resultados" genuíno não deve virar mensagem de erro.
  if (merged.length === 0 && googleError) {
    throw googleError
  }

  return merged
}
