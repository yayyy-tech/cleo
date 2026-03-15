import { useStore } from '../store/useStore'
import { api } from '../lib/api'

export function useTransactions() {
  const { setTransactions, setAccounts } = useStore()

  const fetchTransactions = async (filters?: {
    category?: string
    from?: string
    to?: string
    limit?: number
  }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.from) params.append('from', filters.from)
      if (filters?.to) params.append('to', filters.to)
      if (filters?.limit) params.append('limit', String(filters.limit))

      const { data } = await api.get(`/transactions?${params.toString()}`)

      // Map snake_case from backend to camelCase for frontend
      const mapped = data.transactions.map((t: any) => ({
        id: t.id,
        transactionDate: t.transaction_date,
        amount: t.amount,
        merchantName: t.merchant_name,
        category: t.category,
        emoji: t.emoji,
        rawDescription: t.raw_description,
        transactionType: t.transaction_type,
        isRecurring: t.is_recurring,
        isIncome: t.is_income,
      }))

      setTransactions(mapped)
    } catch (e) {
      console.error('Failed to fetch transactions', e)
    }
  }

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/accounts')
      setAccounts(data.accounts)
    } catch (e) {
      console.error('Failed to fetch accounts', e)
    }
  }

  return { fetchTransactions, fetchAccounts }
}