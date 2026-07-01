// BookVerse — Amigos
//
// Três seções: busca de pessoas, pedidos recebidos pendentes, e lista de
// amigos já confirmados. Cada item de busca mostra o botão certo conforme
// o estado atual da relação (ver friendsService.getFriendshipStatus).

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  searchUsers,
  getFriendshipStatus,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  subscribeToFriends,
  subscribeToIncomingRequests,
} from '../services/friendsService'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { Field } from '../components/Field'

export default function Amigos() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [searchText, setSearchText] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchStatuses, setSearchStatuses] = useState({}) // uid -> status
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    const unsubFriends = subscribeToFriends(currentUser.uid, setFriends)
    const unsubRequests = subscribeToIncomingRequests(currentUser.uid, setRequests)
    return () => {
      unsubFriends()
      unsubRequests()
    }
  }, [currentUser])

  useEffect(() => {
    const trimmed = searchText.trim()
    if (trimmed.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(trimmed, currentUser.uid)
        if (cancelled) return
        setSearchResults(results)

        const statuses = {}
        await Promise.all(
          results.map(async (u) => {
            statuses[u.uid] = await getFriendshipStatus(currentUser.uid, u.uid)
          })
        )
        if (!cancelled) setSearchStatuses(statuses)
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchText, currentUser])

  async function handleSendRequest(targetUid) {
    setSearchStatuses((s) => ({ ...s, [targetUid]: 'request_sent' }))
    await sendFriendRequest(currentUser, targetUid)
  }

  async function handleCancelRequest(targetUid) {
    setSearchStatuses((s) => ({ ...s, [targetUid]: 'none' }))
    await cancelFriendRequest(currentUser.uid, targetUid)
  }

  async function handleAccept(request) {
    await acceptFriendRequest(currentUser.uid, request)
  }

  async function handleDecline(fromUid) {
    await declineFriendRequest(currentUser.uid, fromUid)
  }

  return (
    <AppShell>
      <div className="bv-container" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <h1 className="bv-title" style={{ marginBottom: 20 }}>
          Amigos
        </h1>

        <Field
          id="searchUsers"
          label="Buscar pessoas pelo nome"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Ex: Ana"
        />

        {searching && <p className="bv-text-muted">Buscando…</p>}

        {searchResults.length > 0 && (
          <div className="bv-list" style={{ marginBottom: 28 }}>
            {searchResults.map((u) => (
              <div key={u.uid} className="bv-user-row">
                <button className="bv-user-row-main" onClick={() => navigate(`/usuario/${u.uid}`)}>
                  <Avatar name={u.name} photoURL={u.photoURL} />
                  <span className="bv-user-row-name">{u.name}</span>
                </button>
                <FriendActionButton
                  status={searchStatuses[u.uid] || 'none'}
                  onAdd={() => handleSendRequest(u.uid)}
                  onCancel={() => handleCancelRequest(u.uid)}
                />
              </div>
            ))}
          </div>
        )}

        {requests.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <p className="bv-settings-label">Pedidos recebidos</p>
            <div className="bv-list">
              {requests.map((req) => (
                <div key={req.uid} className="bv-user-row">
                  <button className="bv-user-row-main" onClick={() => navigate(`/usuario/${req.fromUid}`)}>
                    <Avatar name={req.fromName} photoURL={req.fromPhotoURL} />
                    <span className="bv-user-row-name">{req.fromName}</span>
                  </button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="bv-chip bv-chip--active" onClick={() => handleAccept(req)}>
                      Aceitar
                    </button>
                    <button className="bv-chip" onClick={() => handleDecline(req.fromUid)}>
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <p className="bv-settings-label">
            {friends.length > 0 ? `Seus amigos (${friends.length})` : 'Seus amigos'}
          </p>
          {friends.length === 0 ? (
            <p className="bv-text-muted">
              Você ainda não tem amigos no BookVerse. Use a busca acima para encontrar pessoas.
            </p>
          ) : (
            <div className="bv-list">
              {friends.map((f) => (
                <button
                  key={f.uid}
                  className="bv-user-row-main bv-user-row"
                  onClick={() => navigate(`/usuario/${f.uid}`)}
                >
                  <Avatar name={f.name} photoURL={f.photoURL} />
                  <span className="bv-user-row-name">{f.name || 'Leitor'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function FriendActionButton({ status, onAdd, onCancel }) {
  if (status === 'friends') {
    return <span className="bv-text-muted" style={{ fontSize: '0.8rem' }}>Amigos</span>
  }
  if (status === 'request_sent') {
    return (
      <button className="bv-chip" onClick={onCancel}>
        Cancelar
      </button>
    )
  }
  if (status === 'request_received') {
    return <span className="bv-text-muted" style={{ fontSize: '0.8rem' }}>Te chamou</span>
  }
  return (
    <button className="bv-chip bv-chip--active" onClick={onAdd}>
      Adicionar
    </button>
  )
}
