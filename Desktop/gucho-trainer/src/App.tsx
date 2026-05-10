import { useState } from 'react'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import DrillPage from './pages/DrillPage'
import ResultPage from './pages/ResultPage'
import type { Page, Session } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [currentSession, setCurrentSession] = useState<Session | null>(null)

  const handleFinish = (session: Session) => {
    setCurrentSession(session)
    setPage('result')
  }

  if (page === 'practice') {
    return <PracticePage onFinish={handleFinish} onBack={() => setPage('home')} />
  }

  if (page === 'drill') {
    return <DrillPage onFinish={handleFinish} onBack={() => setPage('home')} />
  }

  if (page === 'result' && currentSession) {
    return <ResultPage session={currentSession} onHome={() => setPage('home')} />
  }

  return (
    <HomePage
      onStartPractice={() => setPage('practice')}
      onStartDrill={() => setPage('drill')}
      onViewResult={session => {
        setCurrentSession(session)
        setPage('result')
      }}
    />
  )
}
