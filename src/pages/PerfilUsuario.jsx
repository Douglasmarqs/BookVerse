// BookVerse — Perfil de outro usuário
//
// Mostra stats públicos, botão de amizade (com o estado certo conforme a
// relação atual) e uma prévia da estante (até 10 livros mais recentes).
// Ver nota de privacidade em userProfileService.js: a estante é pública
// por padrão nesta versão — ainda não existe opção de privacidade.

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserProfile, subscribeToUserBooksPreview } from '../services/userProfileService'
import {
  getFriendshipStatus,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
} from '../services/friendsService'
import { AppShell } from '../components/AppShell'
import { Avatar } from '../components/Avatar'
import { BookCard } from '../components/BookCard'
import { Button } from '../components/Button'

export default function PerfilUsuario() {
  const { uid } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [books, setBooks] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getUserProfile(uid).then((data) => {
      if (!data) {
        setNotFound(true)
      } else {
        setProfile(data)
      }
    })
  }, [uid])

  useEffect(() => {
    const unsubscribe = subscribeToUserBooksPreview(uid, setBooks)
    return unsubscribe
  }, [uid])

  useEffect(() => {
    if (!currentUser || uid === currentUser.uid) return
    getFriendshipStatus(currentUser.uid, uid).then(setStatus)
  }, [currentUser, uid])

  if (notFound) {
    return (
      <div className="bv-screen">
        <div className="bv-center">
          <p className="bv-title">Esse perfil não existe.</p>
          <Button variant="ghost-on-paper" onClick={() => navigate('/amigos')} style={{ marginTop: 16 }}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bv-screen">
        <div className="bv-center">
          <p className="bv-text-muted">Carregando…</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.uid === uid

  async function handleAdd() {
    setStatus('request_sent')
    await sendFriendRequest(currentUser, uid)
  }

  async function handleCancel() {
    setStatus('none')
    await cancelFriendRequest(currentUser.uid, uid)
  }

  async function handleAccept() {
    await acceptFriendRequest(currentUser.uid, {
      fromUid: uid,
      fromName: profile.name,
      fromPhotoURL: profile.photoURL,
    })
    setStatus('friends')
  }

  async function handleDecline() {
    await declineFriendRequest(currentUser.uid, uid)
    setStatus('none')
  }

  async function handleUnfriend() {
    const confirmed = window.confirm(`Desfazer amizade com ${profile.name}?`)
    if (!confirmed) return
    await removeFriend(currentUser.uid, uid)
    setStatus('none')
  }

  return (
    <div className="bv-screen">
      <div className="bv-page-header">
        <button className="bv-back-button" onClick={() => navigate(-1)} aria-label="Voltar">
          ←
        </button>
      </div>

      <div className="bv-container" style={{ paddingBottom: 60, textAlign: 'center' }}>
        <Avatar name={profile.name} photoURL={profile.photoURL} size={88} />
        <h1 className="bv-title" style={{ marginTop: 16, marginBottom: 4 }}>
          {profile.name}
        </h1>
        {profile.bio && (
          <p className="bv-text-muted" style={{ marginBottom: 16 }}>
            {profile.bio}
          </p>
        )}

        <div className="bv-stats-grid" style={{ marginTop: 16, marginBottom: 24 }}>
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{profile.stats?.streakCount || 0}</span>
            <span className="bv-stat-label">sequência</span>
          </div>
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{profile.stats?.pagesRead || 0}</span>
            <span className="bv-stat-label">páginas</span>
          </div>
          <div className="bv-stat-tile">
            <span className="bv-stat-value">{profile.stats?.booksFinished || 0}</span>
            <span className="bv-stat-label">concluídos</span>
          </div>
        </div>

        {!isOwnProfile && (
          <div style={{ maxWidth: 280, margin: '0 auto 32px' }}>
            {status === 'friends' && (
              <Button variant="ghost-on-paper" onClick={handleUnfriend}>
                Amigos · Desfazer
              </Button>
            )}
            {status === 'request_sent' && (
              <Button variant="ghost-on-paper" onClick={handleCancel}>
                Cancelar pedido
              </Button>
            )}
            {status === 'request_received' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button onClick={handleAccept}>Aceitar</Button>
                <Button variant="ghost-on-paper" onClick={handleDecline}>
                  Recusar
                </Button>
              </div>
            )}
            {status === 'none' && <Button onClick={handleAdd}>Adicionar amigo</Button>}
          </div>
        )}

        {books.length > 0 && (
          <div style={{ textAlign: 'left' }}>
            <p className="bv-settings-label">Estante</p>
            <div className="bv-list">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => {}} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
