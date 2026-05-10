import { useState, useRef } from 'react'
import { getRandomDrillPair, evaluateDrillAnswer } from '../lib/claude'
import type { Message, Session } from '../types'

interface Props {
  onFinish: (session: Session) => void
  onBack: () => void
}

interface DrillRecord {
  wordA: string
  wordB: string
  answer: string
  feedback: string
}

export default function DrillPage({ onFinish, onBack }: Props) {
  const [pair, setPair] = useState(getRandomDrillPair)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<DrillRecord[]>([])
  const sessionId = useRef(crypto.randomUUID())
  const createdAt = useRef(Date.now())

  const submit = async () => {
    if (!answer.trim() || isLoading) return
    setIsLoading(true)
    const fb = await evaluateDrillAnswer(pair.wordA, pair.wordB, answer)
    setFeedback(fb)
    setHistory(prev => [...prev, { ...pair, answer: answer.trim(), feedback: fb }])
    setIsLoading(false)
  }

  const next = () => {
    setFeedback(null)
    setAnswer('')
    setPair(getRandomDrillPair())
  }

  const handleFinish = () => {
    const messages: Message[] = history.flatMap(h => [
      {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content: `「${h.wordA}」と「${h.wordB}」→ ${h.answer}`,
        timestamp: Date.now(),
      },
      {
        id: crypto.randomUUID(),
        role: 'interviewer' as const,
        content: h.feedback,
        timestamp: Date.now(),
      },
    ])
    onFinish({
      id: sessionId.current,
      theme: `抽象化ドリル（${history.length}問）`,
      mode: 'drill',
      messages,
      createdAt: createdAt.current,
      completedAt: Date.now(),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-sm">
            ← 戻る
          </button>
          {history.length > 0 && (
            <button
              onClick={handleFinish}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
            >
              終了して保存（{history.length}問）
            </button>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🧩</div>
          <h2 className="text-xl font-bold text-gray-900">抽象化ドリル</h2>
          <p className="text-gray-400 text-sm mt-1">真反対のものを抽象化して「一緒だ」と表現する</p>
        </div>

        {/* 問題カード */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
          <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-wide">
            問題 {history.length + 1}
          </p>
          <div className="flex items-center justify-center gap-6 mb-5">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500">{pair.wordA}</div>
            </div>
            <div className="text-gray-200 text-2xl font-light">と</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{pair.wordB}</div>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            この2つを抽象化すると、どういう意味で「一緒」と言えますか？
          </p>
        </div>

        {/* 回答 or フィードバック */}
        {!feedback ? (
          <div>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
              placeholder={`「${pair.wordA}と${pair.wordB}は〇〇という意味で一緒」`}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 mb-3"
              rows={3}
            />
            <button
              onClick={submit}
              disabled={!answer.trim() || isLoading}
              className="w-full bg-orange-500 text-white rounded-xl py-3 font-bold disabled:opacity-40 hover:bg-orange-600 active:scale-95 transition-all"
            >
              {isLoading ? '評価中...' : '答える'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-800">
              <div className="font-bold text-xs mb-1.5">🎯 フィードバック</div>
              <p className="leading-relaxed">{feedback}</p>
            </div>
            <button
              onClick={next}
              className="w-full bg-gray-800 text-white rounded-xl py-3 font-bold hover:bg-gray-700 active:scale-95 transition-all"
            >
              次の問題へ →
            </button>
          </div>
        )}

        {/* 解いた問題の履歴 */}
        {history.length > 0 && (
          <div className="mt-8">
            <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">
              解いた問題
            </p>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl px-4 py-3 border border-gray-100 text-xs text-gray-500 flex items-center gap-2"
                >
                  <span className="font-bold text-red-400">{h.wordA}</span>
                  <span className="text-gray-300">と</span>
                  <span className="font-bold text-blue-400">{h.wordB}</span>
                  <span className="text-gray-300 mx-1">→</span>
                  <span className="text-gray-600 truncate">{h.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
