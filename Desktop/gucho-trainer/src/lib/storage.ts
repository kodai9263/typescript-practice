import type { Session } from '../types'

const KEY = 'gucho_sessions'

export const getSessions = (): Session[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export const upsertSession = (session: Session): void => {
  const all = getSessions()
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export const removeSession = (id: string): void => {
  localStorage.setItem(KEY, JSON.stringify(getSessions().filter(s => s.id !== id)))
}
