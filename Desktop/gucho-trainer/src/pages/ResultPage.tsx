import { useState, useEffect } from 'react'
import { analyzeSession } from '../lib/claude'
import { upsertSession } from '../lib/storage'
import TriangleChart from '../components/TriangleChart'
import type { Session } from '../types'

interface Props {
  session: Session
  onHome: () => void
}

export default function ResultPage({ session: initialSession, onHome }: Props) {
  const [session, setSession] = useState(initialSession)
  const [isAnalyzing, setIsAnalyzing] = useState(!initialSession.analysis)

  useEffect(() => {
    if (initialSession.analysis) return
    const userMsgCount = initialSession.messages.filter(m => m.role === 'user').length
    if (userMsgCount === 0) {
      upsertSession(initialSession)
      setIsAnalyzing(false)
      return
    }
    analyzeSession(initialSession.theme, initialSession.messages).then(analysis => {
      const updated = { ...initialSession, analysis }
      setSession(updated)
      upsertSession(updated)
      setIsAnalyzing(false)
    })
  }, [])

  const score = session.analysis?.triangleScore ?? null
  const scoreColor =
    score === null ? 'text-gray-400'
    : score >= 70 ? 'text-green-600'
    : score >= 40 ? 'text-yellow-500'
    : 'text-red-400'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">振り返り</h2>
            <div className="text-sm text-gray-400 mt-0.5">
              {session.mode === 'interview' ? '👔' : '🧩'} {session.theme}
            </div>
          </div>
          <button
            onClick={onHome}
            className="bg-gray-800 text-white text-sm rounded-lg px-4 py-2 hover:bg-gray-700 transition"
          >
            ホームへ
          </button>
        </div>

        {/* 分析中 */}
        {isAnalyzing ? (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center mb-5">
            <div className="text-3xl mb-3">⏳</div>
            <div className="text-gray-400 text-sm">会話を分析中...</div>
          </div>
        ) : session.analysis ? (
          <div className="space-y-4 mb-6">
            {/* 三角形スコア */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wide">
                三角形スコア（具体と抽象の往復力）
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <TriangleChart
                  triangleScore={session.analysis.triangleScore}
                  abstractRatio={session.analysis.abstractRatio}
                />
                <div className="text-center sm:text-left">
                  <div className={`text-5xl font-bold ${scoreColor}`}>
                    {session.analysis.triangleScore}
                    <span className="text-lg font-normal text-gray-400 ml-1">点</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {score !== null && score >= 70
                      ? '具体と抽象の往復が上手くできています！'
                      : score !== null && score >= 40
                      ? '往復の意識を高めるとさらに良くなります'
                      : '具体または抽象に偏っています'}
                  </div>
                </div>
              </div>
            </div>

            {/* 偏りの指摘 */}
            {session.analysis.biases.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-amber-600 mb-3 uppercase tracking-wide">
                  ⚠️ 気になった偏り
                </h3>
                <ul className="space-y-2">
                  {session.analysis.biases.map((bias, i) => (
                    <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{bias}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 総合フィードバック */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-indigo-500 mb-2 uppercase tracking-wide">
                💬 総合フィードバック
              </h3>
              <p className="text-sm text-indigo-800 leading-relaxed">{session.analysis.feedback}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center mb-5 text-gray-400 text-sm">
            回答がないため分析できません
          </div>
        )}

        {/* 会話ログ */}
        {session.messages.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">会話ログ</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {session.messages.map(msg => (
                <div key={msg.id} className="px-5 py-4">
                  <div className="text-xs text-gray-400 mb-1.5">
                    {msg.role === 'interviewer' ? '👔 面接官' : '🧑 あなた'}
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">{msg.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
