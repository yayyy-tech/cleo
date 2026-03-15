import { create } from 'zustand'

interface User {
  id: string
  supabaseAuthId: string
  phone: string
  name?: string
  email?: string
  monthlyIncomeEstimate?: number
  occupation?: string
  city?: string
  onboardingComplete: boolean
}

interface Account {
  id: string
  accountName: string
  accountType: string
  bankName?: string
  maskedAccountNumber?: string
  currentBalance: number
  isPrimary: boolean
}

interface Transaction {
  id: string
  transactionDate: string
  amount: number
  merchantName?: string
  category?: string
  emoji?: string
  rawDescription: string
  transactionType: 'DEBIT' | 'CREDIT'
  isRecurring: boolean
  isIncome: boolean
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  uiComponent?: unknown
  isRoast?: boolean
  createdAt: string
  isStreaming?: boolean
}

interface Insight {
  id: string
  title?: string
  insightText?: string
  actionSuggestion?: string
  category?: string
  severity?: string
  isRead: boolean
}

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setAuthenticated: (val: boolean) => void

  // Accounts
  accounts: Account[]
  setAccounts: (accounts: Account[]) => void
  totalBalance: number

  // Transactions
  transactions: Transaction[]
  setTransactions: (txns: Transaction[]) => void

  // Chat
  messages: Message[]
  isTyping: boolean
  addMessage: (msg: Message) => void
  setMessages: (msgs: Message[]) => void
  setTyping: (val: boolean) => void
  updateStreamingMessage: (id: string, chunk: string) => void
  finalizeStreamingMessage: (id: string) => void

  // Insights
  insights: Insight[]
  setInsights: (insights: Insight[]) => void
  unreadInsightCount: number

  // Voice
  isVoiceMode: boolean
  isRecording: boolean
  setVoiceMode: (val: boolean) => void
  setRecording: (val: boolean) => void

  // UI
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const useStore = create<AppState>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user }),
  setAuthenticated: (val) => set({ isAuthenticated: val }),

  // Accounts
  accounts: [],
  setAccounts: (accounts) => {
    const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0)
    set({ accounts, totalBalance })
  },
  totalBalance: 0,

  // Transactions
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),

  // Chat
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setTyping: (val) => set({ isTyping: val }),
  updateStreamingMessage: (id, chunk) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, content: m.content + chunk } : m
    )
  })),
  finalizeStreamingMessage: (id) => set((state) => ({
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, isStreaming: false } : m
    )
  })),

  // Insights
  insights: [],
  setInsights: (insights) => set({
    insights,
    unreadInsightCount: insights.filter(i => !i.isRead).length
  }),
  unreadInsightCount: 0,

  // Voice
  isVoiceMode: false,
  isRecording: false,
  setVoiceMode: (val) => set({ isVoiceMode: val }),
  setRecording: (val) => set({ isRecording: val }),

  // UI
  activeTab: 'chat',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
