import { useState } from 'react'
import { getSessions, removeSession } from '../lib/storage'
import type { Session } from '../types'

interface Props {
  onStartPractice: () => void
  onStartDrill: () => void
  onViewResult: (session: Session) => void
}

export default function HomePage({ onStartPractice, onStartDrill, onViewResult }: Props) {
  const [sessions, setSessions] = useState<Session[]>(getSessions)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeSession(id)
    setSessions(getSessions())
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">具抽トレーナー</h1>
          <p className="text-gray-400 mt-2 text-sm">具体と抽象の往復で、面接力を鍛える</p>
        </div>

        {/* メインアクション */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            onClick={onStartPractice}
            className="bg-indigo-600 text-white rounded-2xl p-6 text-left hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <div className="text-3xl mb-3">👔</div>
            <div className="font-bold text-lg leading-tight">面接練習</div>
            <div className="text-indigo-200 text-xs mt-1.5 leading-relaxed">
              経験や学びを語る。<br />面接官が具体・抽象で深掘りする。
            </div>
          </button>
          <button
            onClick={onStartDrill}
            className="bg-orange-500 text-white rounded-2xl p-6 text-left hover:bg-orange-600 active:scale-95 transition-all"
          >
            <div className="text-3xl mb-3">🧩</div>
            <div className="font-bold text-lg leading-tight">抽象化ドリル</div>
            <div className="text-orange-100 text-xs mt-1.5 leading-relaxed">
              真反対のものを抽象化して<br />「一緒だ」と表現する練習。
            </div>
          </button>
        </div>

        {/* 過去セッション */}
        {sessions.length > 0 ? (
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">過去の練習</h2>
            <div className="space-y-2">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => onViewResult(session)}
                  className="w-full bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">
                      {session.mode === 'interview' ? '👔' : '🧩'}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">{session.theme}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {new Date(session.createdAt).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {session.analysis && (
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                            {session.analysis.triangleScore}点
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={e => handleDelete(e, session.id)}
                    className="text-gray-200 hover:text-red-400 ml-2 p-1 flex-shrink-0 transition-colors"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-300">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">練習を始めると、ここに記録が残ります</p>
          </div>
        )}
      </div>
    </div>
  )
}
