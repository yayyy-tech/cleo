import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as DocumentPicker from 'expo-document-picker'
import { api } from '../../src/lib/api'
import { useStore } from '../../src/store/useStore'
import { useTransactions } from '../../src/hooks/useTransactions'
import { getCategoryEmoji } from '../../src/constants/categories'
import { COLORS } from '../../src/constants/theme'

export default function WalletScreen() {
  const { transactions } = useStore()
  const { fetchTransactions } = useTransactions()
  const [uploading, setUploading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [smsSyncing, setSmsSyncing] = useState(false)
  const [lastSmsSync, setLastSmsSync] = useState<Date | null>(null)

  useEffect(() => {
    fetchTransactions()
    fetchSummary()
    // Load last SMS sync time if stored
    ;(async () => {
      try {
        const value = await AsyncStorage.getItem('dime:lastSmsSync')
        if (value) {
          const ts = Number(value)
          if (!Number.isNaN(ts)) setLastSmsSync(new Date(ts))
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/transactions/summary')
      setSummary(data)
    } catch (e) {
      console.log('Summary fetch failed', e)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchTransactions()
    await fetchSummary()
    setRefreshing(false)
  }

  const uploadCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      })
      if (result.canceled) return

      const file = result.assets[0]
      setUploading(true)

      const formData = new FormData()
      formData.append(
        'file',
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any
      )

      const { data } = await api.post('/transactions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUploading(false)
      Alert.alert('Imported!', `${data.imported} transactions added.`)
      fetchTransactions()
      fetchSummary()
    } catch (e) {
      setUploading(false)
      Alert.alert('Error', 'Upload failed. Make sure it is a valid bank statement PDF, Excel or CSV.')
    }
  }

  const formatAmount = (amount: number) => {
    const abs = Math.abs(amount)
    if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`
    if (abs >= 1000) return `₹${(abs / 1000).toFixed(1)}K`
    return `₹${abs.toFixed(0)}`
  }

  const filteredTransactions = transactions.filter(t => {
    if (activeFilter === 'debits') return t.transactionType === 'DEBIT'
    if (activeFilter === 'credits') return t.transactionType === 'CREDIT'
    return true
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.violet} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Wallet</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Your money, all in one place</Text>
          </View>
          <TouchableOpacity
            onPress={uploadCSV}
            disabled={uploading}
            style={{ backgroundColor: COLORS.violet, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            {uploading
              ? <ActivityIndicator color="white" size="small" />
              : <Text style={{ fontSize: 14 }}>📂</Text>
            }
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>
              {uploading ? 'Uploading...' : 'Import PDF, Excel or CSV'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SMS sync banner */}
        {smsSyncing && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              backgroundColor: COLORS.bgCard,
              borderWidth: 1,
              borderColor: COLORS.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>🔄</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
              Syncing transactions from SMS...
            </Text>
            {lastSmsSync && (
              <Text style={{ color: COLORS.textSecondary, fontSize: 11, marginLeft: 'auto' }}>
                Last updated:{' '}
                {Math.max(1, Math.round((Date.now() - lastSmsSync.getTime()) / 60000))} mins ago
              </Text>
            )}
          </View>
        )}

        {transactions.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32, gap: 16 }}>
            <Text style={{ fontSize: 48 }}>🏦</Text>
            <Text style={{ color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              No transactions yet
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' }}>
              Import your bank statement PDF, Excel or CSV to see your spending breakdown
            </Text>
            <TouchableOpacity
              onPress={uploadCSV}
              disabled={uploading}
              style={{ backgroundColor: COLORS.violet, borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 }}
            >
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                Upload bank statement
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Summary cards */}
            {summary && (
              <View style={{ paddingHorizontal: 16, gap: 12, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Total Spent</Text>
                    <Text style={{ color: COLORS.red, fontSize: 22, fontWeight: 'bold' }}>
                      {formatAmount(summary.total_spend || 0)}
                    </Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>this month</Text>
                  </View>
                  <View style={{ flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Total Income</Text>
                    <Text style={{ color: COLORS.green, fontSize: 22, fontWeight: 'bold' }}>
                      {formatAmount(summary.total_income || 0)}
                    </Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>this month</Text>
                  </View>
                </View>

                {summary.by_category && summary.by_category.length > 0 && (
                  <View style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' }}>
                      Spending by category
                    </Text>
                    {summary.by_category.slice(0, 6).map((cat: any) => {
                      const pct = summary.total_spend > 0 ? (cat.amount / summary.total_spend) * 100 : 0
                      return (
                        <View key={cat.category} style={{ gap: 4 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ fontSize: 16 }}>{cat.emoji || getCategoryEmoji(cat.category)}</Text>
                              <Text style={{ color: COLORS.textPrimary, fontSize: 13 }}>{cat.category}</Text>
                            </View>
                            <Text style={{ color: COLORS.textPrimary, fontSize: 13, fontWeight: '500' }}>
                              {formatAmount(cat.amount)}
                            </Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', backgroundColor: COLORS.violet, borderRadius: 3, width: `${Math.min(pct, 100)}%` }} />
                          </View>
                        </View>
                      )
                    })}
                  </View>
                )}
              </View>
            )}

            {/* Filter tabs */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 }}>
              {['all', 'debits', 'credits'].map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1,
                    backgroundColor: activeFilter === f ? COLORS.violet : COLORS.bgCard,
                    borderColor: activeFilter === f ? COLORS.violet : COLORS.border,
                  }}
                >
                  <Text style={{ color: activeFilter === f ? 'white' : COLORS.textMuted, fontSize: 13, fontWeight: '500' }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Transaction list */}
            <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 32 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 13, marginBottom: 4 }}>
                {filteredTransactions.length} transactions
              </Text>
              {filteredTransactions.slice(0, 50).map((txn) => (
                <View
                  key={txn.id}
                  style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>{txn.emoji || getCategoryEmoji(txn.category || '')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
                      {txn.merchantName || txn.rawDescription}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>
                        {txn.category || 'Uncategorized'} ·{' '}
                        {new Date(txn.transactionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                      {txn.source === 'SMS' && (
                        <View
                          style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 999,
                            backgroundColor: COLORS.bgElevated,
                            borderWidth: 1,
                            borderColor: COLORS.borderLight,
                          }}
                        >
                          <Text style={{ color: COLORS.textSecondary, fontSize: 10, fontWeight: '600' }}>
                            SMS
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: txn.transactionType === 'CREDIT' ? COLORS.green : COLORS.textPrimary }}>
                    {txn.transactionType === 'CREDIT' ? '+' : '-'}{formatAmount(Math.abs(txn.amount))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}