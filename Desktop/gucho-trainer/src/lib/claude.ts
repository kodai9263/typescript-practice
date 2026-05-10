import Anthropic from '@anthropic-ai/sdk'
import type { Message, SessionAnalysis } from '../types'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const INTERVIEWER_SYSTEM = `あなたは面接官として候補者の話を引き出す役割です。

【具体と抽象のフレームワーク】
- 抽象度（高）：本質・原則・法則・パターン
- 抽象度（低）：具体的事実・数字・エピソード・行動
- 「頭がいい人」は具体と抽象を自在に往復できる（三角形が大きい）

【質問のガイドライン】
- 抽象的な話が続く場合 → 「具体的なエピソードを教えてください」「数字や事実で話してもらえますか？」
- 具体的な話が続く場合 → 「それをひと言で表すと？」「なぜそうなると思いますか？」「他の場面にも応用できますか？」
- 自分の話ばかりの場合 → 「周りの人はどう受け取っていましたか？」
- 他人ばかり抽象化している場合 → 「あなた自身はどう行動しましたか？」
- 抽象論だけの場合（本質マン）→ 「具体的な経験を一つ挙げるとしたら？」

【ルール】
- 質問は1〜2文で簡潔に
- 圧迫せず、対話的に引き出すスタイル
- 必ず日本語で回答
- 最初の質問は「まず一言で表すとどういうことでしょうか？」から始める`

export async function getInterviewerResponse(
  theme: string,
  messages: Message[]
): Promise<string> {
  const apiMessages: { role: 'user' | 'assistant'; content: string }[] = []

  if (messages.length === 0) {
    apiMessages.push({
      role: 'user',
      content: `面接練習のテーマ：「${theme}」\nこのテーマについて話します。`,
    })
  } else {
    messages.forEach(m => {
      apiMessages.push({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })
    })
  }

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: INTERVIEWER_SYSTEM,
    messages: apiMessages,
  })

  return res.content[0].type === 'text' ? res.content[0].text : ''
}

export async function getHelpText(
  content: string,
  direction: 'concrete' | 'abstract'
): Promise<string> {
  const prompt =
    direction === 'concrete'
      ? `以下の発言を"より具体的"にリライトしてください。数字・エピソード・行動・固有名詞を加えて面接で使えるレベルに整えてください。\n\n元の発言：${content}`
      : `以下の発言を"抽象化・本質化"してリライトしてください。「つまり本質は〇〇」という形で上位概念にまとめてください。\n\n元の発言：${content}`

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return res.content[0].type === 'text' ? res.content[0].text : ''
}

export async function analyzeSession(
  theme: string,
  messages: Message[]
): Promise<SessionAnalysis> {
  const conversation = messages
    .map(m => `${m.role === 'user' ? '候補者' : '面接官'}：${m.content}`)
    .join('\n')

  const prompt = `以下の面接練習会話を分析し、JSONのみで返してください。

テーマ：${theme}
会話：
${conversation}

{
  "abstractRatio": 候補者発言のうち抽象的な内容の割合（0-100の整数）,
  "triangleScore": 具体と抽象の往復スコア（0-100の整数。一方だけ=低、往復できている=高）,
  "biases": ["偏りの指摘1", "偏りの指摘2"],
  "feedback": "総合フィードバック2〜3文"
}

評価基準：
- triangleScoreは往復の質で決まる（50点が平均、80点以上は優秀）
- biasesは「他人ばかり抽象化していた」「具体例がなく本質論に偏っていた」などを最大3つ
- なければbiasesは空配列`

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = res.content[0].type === 'text' ? res.content[0].text : '{}'
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : defaultAnalysis()
  } catch {
    return defaultAnalysis()
  }
}

function defaultAnalysis(): SessionAnalysis {
  return { abstractRatio: 50, triangleScore: 50, feedback: '分析に失敗しました。', biases: [] }
}

const DRILL_PAIRS = [
  { wordA: '成功', wordB: '失敗' },
  { wordA: '速い', wordB: '遅い' },
  { wordA: '強い', wordB: '弱い' },
  { wordA: '好き', wordB: '嫌い' },
  { wordA: '増える', wordB: '減る' },
  { wordA: '始まり', wordB: '終わり' },
  { wordA: '喜び', wordB: '悲しみ' },
  { wordA: '攻め', wordB: '守り' },
  { wordA: '新しい', wordB: '古い' },
  { wordA: 'リスク', wordB: 'チャンス' },
  { wordA: '褒める', wordB: '叱る' },
  { wordA: '自信', wordB: '不安' },
]

export function getRandomDrillPair() {
  return DRILL_PAIRS[Math.floor(Math.random() * DRILL_PAIRS.length)]
}

export async function evaluateDrillAnswer(
  wordA: string,
  wordB: string,
  answer: string
): Promise<string> {
  const prompt = `「${wordA}」と「${wordB}」を抽象化して"一緒だ"と表現する練習問題への回答を評価してください。

回答：「${answer}」

評価観点：
1. 両方を包む上位概念が見つかっているか
2. 抽象化が本質的か（言葉遊びでなく）
3. 具体例で補強できているか

フィードバックと模範解答を2〜4文で返してください。`

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  return res.content[0].type === 'text' ? res.content[0].text : ''
}
