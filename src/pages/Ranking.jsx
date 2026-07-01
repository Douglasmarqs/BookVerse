// BookVerse — Ranking entre amigos
//
// Versão inicial: ranking por total de páginas lidas (vitalício), entre
// você e seus amigos confirmados. NÃO é o ranking semanal/mensal descrito
// no planejamento original — isso exigiria períodos com reset automático
// (uma Cloud Function agendada, "scheduled function"), que ainda não foi
// construída. Sem amigos adicionados, mostra só você.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { subscribeToFriends } from '../services/friendsService'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'

export default function Ranking() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState(null)

  useEffect(() => {
    if (!currentUser) return

    let cancelled = false

    const unsubscribe = subscribeToFriends(currentUser.uid, async (friends) => {
      const meSnap = await getDoc(doc(db, 'users', currentUser.uid))
      const me = {
        uid: currentUser.uid,
        name: currentUser.displayName || 'Você',
        photoURL: currentUser.photoURL,
        pagesRead: meSnap.data()?.stats?.pagesRead || 0,
        isMe: true,
      }

      const friendEntries = await Promise.all(
        friends.map(async (f) => {
          const snap = await getDoc(doc(db, 'users', f.uid))
          return {
            uid: f.uid,
            name: f.name || 'Leitor',
            photoURL: f.photoURL,
            pagesRead: snap.data()?.stats?.pagesRead || 0,
            isMe: false,
          }
        })
      )

      if (cancelled) return

      const sorted = [me, ...friendEntries].sort((a, b) => b.pagesRead - a.pagesRead)
      setEntries(sorted)
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [currentUser])

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ marginBottom: 4 }}>
          Ranking entre amigos
        </h1>
        <p className="bv-text-muted" style={{ marginBottom: 20 }}>
          Por total de páginas lidas.
        </p>

        {entries === null ? (
          <p className="bv-text-muted">Carregando…</p>
        ) : (
          <div className="bv-list">
            {entries.map((entry, index) => (
              <button
                key={entry.uid}
                className="bv-ranking-row"
                onClick={() => !entry.isMe && navigate(`/usuario/${entry.uid}`)}
              >
                <span className="bv-ranking-position">{index + 1}</span>
                <Avatar name={entry.name} photoURL={entry.photoURL} size={36} />
                <span className="bv-ranking-name">{entry.isMe ? 'Você' : entry.name}</span>
                <span className="bv-ranking-pages">{entry.pagesRead}</span>
              </button>
            ))}
          </div>
        )}

        {entries && entries.length === 1 && (
          <p className="bv-text-muted" style={{ marginTop: 16 }}>
            Adicione amigos para ver como sua leitura se compara à deles.
          </p>
        )}
      </div>
    </AppShell>
  )
}
