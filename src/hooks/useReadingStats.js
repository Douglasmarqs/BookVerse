// BookVerse — Hook de estatísticas de leitura
//
// Centraliza a leitura de stats/preferências/log diário/biblioteca que
// tanto o Dashboard quanto a Lumi precisam. Evita duplicar 3 listeners
// do Firestore em duas telas diferentes.

import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { subscribeToLibrary, getTodayId, getYesterdayId } from '../services/libraryService'

const DEFAULT_DAILY_GOAL = 20

function getDisplayStreak(stats) {
  if (!stats?.lastReadDate) return 0
  const today = getTodayId()
  const yesterday = getYesterdayId()
  if (stats.lastReadDate === today || stats.lastReadDate === yesterday) {
    return stats.streakCount || 0
  }
  return 0
}

export function useReadingStats() {
  const { currentUser } = useAuth()
  const [stats, setStats] = useState(null)
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_DAILY_GOAL)
  const [todayPages, setTodayPages] = useState(0)
  const [books, setBooks] = useState([])

  useEffect(() => {
    if (!currentUser) return
    const ref = doc(db, 'users', currentUser.uid)
    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data()
      setStats(data?.stats || null)
      setDailyGoal(data?.preferences?.dailyGoalPages || DEFAULT_DAILY_GOAL)
    })
    return unsubscribe
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const logRef = doc(db, 'users', currentUser.uid, 'readingLog', getTodayId())
    const unsubscribe = onSnapshot(logRef, (snap) => setTodayPages(snap.data()?.pagesRead || 0))
    return unsubscribe
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const unsubscribe = subscribeToLibrary(currentUser.uid, setBooks)
    return unsubscribe
  }, [currentUser])

  const readingNow = books.filter((b) => b.status === 'lendo')
  const streak = getDisplayStreak(stats)

  return { stats, dailyGoal, todayPages, books, readingNow, streak }
}
