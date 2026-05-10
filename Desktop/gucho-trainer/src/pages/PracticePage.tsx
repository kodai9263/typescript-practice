import { useState, useRef, useEffect } from 'react'
import { getInterviewerResponse, getHelpText } from '../lib/claude'
import type { Message, Session } from '../types'

interface Props {
  onFinish: (session: Session) => void
  onBack: () => void
}

const EXAMPLES = [
  'Reactのパフォーマンス改善に取り組んだ',
  'チームのコミュニケーション改善を進めた',
  '最近読んだ本から学んだこと',
  'うまくいかなかったプロジェクトの経験',
]

export default function PracticePage({ onFinish, onBack }: Props) {
  const [phase, setPhase] = useState<'setup' | 'chatting'>('setup')
  const [theme, setTheme] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [helpText, setHelpText] = useState<string | null>(null)
  const [helpMode, setHelpMode] = useState<'concrete' | 'abstract' | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(crypto.randomUUID())
  const createdAt = useRef(Date.now())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const startSession = async () => {
    if (!theme.trim()) return
    setPhase('chatting')
    setIsLoading(true)
    const question = await getInterviewerResponse(theme, [])
    setMessages([{ id: crypto.randomUUID(), role: 'interviewer', content: question, timestamp: Date.now() }])
    setIsLoading(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setHelpText(null)
    setHelpMode(null)
    setIsLoading(true)
    const reply = await getInterviewerResponse(theme, next)
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'interviewer', content: reply, timestamp: Date.now() },
    ])
    setIsLoading(false)
  }

  const handleHelp = async (direction: 'concrete' | 'abstract') => {
    if (!input.trim() || isLoading) return
    setHelpMode(direction)
    setHelpText('考え中...')
    const text = await getHelpText(input, direction)
    setHelpText(text)
  }

  const handleFinish = () => {
    onFinish({
      id: sessionId.current,
      theme,
      mode: 'interview',
      messages,
      createdAt: createdAt.current,
      completedAt: Date.now(),
    })
  }

  // --- セットアップ画面 ---
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <button onClick={onBack} className="text-gray-400 mb-6 flex items-center gap-1 hover:text-gray-600 text-sm">
            ← 戻る
          </button>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-3xl mb-3">👔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">面接練習</h2>
            <p className="text-gray-400 text-sm mb-6">
              経験・スキル・学びのテーマを入力してください。面接官が具体と抽象で深掘りします。
            </p>

            <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">テーマの例</p>
            <div className="space-y-2 mb-5">
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => setTheme(ex)}
                  className={`w-full text-left text-sm rounded-xl px-4 py-2.5 transition-all border ${
                    theme === ex
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>

            <textarea
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="または自由に入力..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-4"
              rows={2}
            />

            <button
              onClick={startSession}
              disabled={!theme.trim()}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              練習を始める →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- チャット画面 ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <div className="font-bold text-gray-900 text-sm">👔 面接練習</div>
          <div className="text-xs text-gray-400 truncate max-w-[200px]">{theme}</div>
        </div>
        <button
          onClick={handleFinish}
          disabled={messages.filter(m => m.role === 'user').length === 0}
          className="bg-gray-800 text-white text-xs rounded-lg px-4 py-2 disabled:opacity-40 hover:bg-gray-700 transition"
        >
          終了して振り返る
        </button>
      </div>

      {/* 会話エリア */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-2xl mx-auto w-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'interviewer' && (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base mr-2 flex-shrink-0 mt-1">
                👔
              </div>
            )}
            <div
              className={`max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base mr-2">👔</div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map(delay => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ヘルプテキスト表示 */}
      {helpText && (
        <div className="max-w-2xl mx-auto w-full px-4 pb-2">
          <div
            className={`rounded-xl p-3 text-sm border ${
              helpMode === 'concrete'
                ? 'bg-orange-50 border-orange-200 text-orange-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            <div className="font-bold text-xs mb-1">
              {helpMode === 'concrete' ? '🔍 具体化の例' : '🔭 抽象化の例'}
            </div>
            <p className="leading-relaxed">{helpText}</p>
            {helpText !== '考え中...' && (
              <button
                onClick={() => { setInput(helpText); setHelpText(null) }}
                className="block mt-2 text-xs underline opacity-60 hover:opacity-100"
              >
                この文を入力欄にコピー
              </button>
            )}
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white border-t border-gray-100 p-4 max-w-2xl mx-auto w-full">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => handleHelp('concrete')}
            disabled={!input.trim() || isLoading}
            className="text-xs bg-orange-50 text-orange-600 border border-orange-200 rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-orange-100 transition"
          >
            🔍 具体化して
          </button>
          <button
            onClick={() => handleHelp('abstract')}
            disabled={!input.trim() || isLoading}
            className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-indigo-100 transition"
          >
            🔭 抽象化して
          </button>
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="回答を入力... (Shift+Enterで改行)"
            className="flex-1 rounded-xl border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white rounded-xl px-4 disabled:opacity-40 hover:bg-indigo-700 active:scale-95 transition-all font-bold"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  )
}
