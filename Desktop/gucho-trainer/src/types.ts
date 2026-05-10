export type MessageRole = 'user' | 'interviewer'
export type AppMode = 'interview' | 'drill'
export type Page = 'home' | 'practice' | 'drill' | 'result'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

export interface SessionAnalysis {
  abstractRatio: number
  triangleScore: number
  feedback: string
  biases: string[]
}

export interface Session {
  id: string
  theme: string
  mode: AppMode
  messages: Message[]
  createdAt: number
  completedAt?: number
  analysis?: SessionAnalysis
}
