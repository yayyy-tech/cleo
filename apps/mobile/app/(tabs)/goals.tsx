import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { api } from '../../src/lib/api'
import { COLORS } from '../../src/constants/theme'
import { CATEGORIES } from '../../src/constants/categories'

interface Budget {
  id: string
  category: string
  monthly_limit: number
  spent: number
  remaining: number
}

interface Goal {
  id: string
  goal_name: string
  target_amount: number
  current_amount: number
  target_date?: string
}

export default function GoalsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [budgetLimit, setBudgetLimit] = useState('')
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [activeTab, setActiveTab] = useState<'budgets' | 'goals'>('budgets')

  useEffect(() => {
    fetchBudgets()
    fetchGoals()
  }, [])

  const fetchBudgets = async () => {
    try {
      const { data } = await api.get('/budgets')
      setBudgets(data.budgets || [])
    } catch (e) {
      console.log('Failed to fetch budgets', e)
    }
  }

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals')
      setGoals(data.goals || [])
    } catch (e) {
      console.log('Failed to fetch goals', e)
    }
  }

  const createBudget = async () => {
    if (!selectedCategory || !budgetLimit) return
    try {
      await api.post('/budgets', {
        category: selectedCategory,
        monthly_limit: parseFloat(budgetLimit),
      })
      setShowBudgetModal(false)
      setSelectedCategory('')
      setBudgetLimit('')
      fetchBudgets()
      Alert.alert('✅ Budget set!', `₹${budgetLimit}/month for ${selectedCategory}`)
    } catch (e) {
      Alert.alert('Error', 'Could not set budget')
    }
  }

  const createGoal = async () => {
    if (!goalName || !goalTarget) return
    try {
      await api.post('/goals', {
        goal_name: goalName,
        target_amount: parseFloat(goalTarget),
      })
      setShowGoalModal(false)
      setGoalName('')
      setGoalTarget('')
      fetchGoals()
      Alert.alert('🎯 Goal created!', `Saving for ${goalName}`)
    } catch (e) {
      Alert.alert('Error', 'Could not create goal')
    }
  }

  const formatAmount = (n: number) => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
    return `₹${n.toFixed(0)}`
  }

  const getBudgetColor = (spent: number, limit: number) => {
    const pct = (spent / limit) * 100
    if (pct >= 100) return COLORS.red
    if (pct >= 80) return COLORS.amber
    return COLORS.green
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgPrimary }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Goals</Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Budgets & savings tracker</Text>
      </View>

      {/* Tab switcher */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
        {(['budgets', 'goals'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center',
              backgroundColor: activeTab === tab ? COLORS.violet : COLORS.bgCard,
              borderWidth: 1,
              borderColor: activeTab === tab ? COLORS.violet : COLORS.border,
            }}
          >
            <Text style={{ color: activeTab === tab ? 'white' : COLORS.textMuted, fontWeight: '600', fontSize: 14 }}>
              {tab === 'budgets' ? '💰 Budgets' : '🎯 Savings'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {activeTab === 'budgets' ? (
          <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}>
            {/* Add budget button */}
            <TouchableOpacity
              onPress={() => setShowBudgetModal(true)}
              style={{ backgroundColor: COLORS.violet, borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 18 }}>+</Text>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Set a budget</Text>
            </TouchableOpacity>

            {budgets.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
                <Text style={{ fontSize: 40 }}>💰</Text>
                <Text style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 15 }}>
                  No budgets set yet.{'\n'}Set limits for each spending category.
                </Text>
              </View>
            ) : (
              budgets.map(budget => {
                const pct = Math.min((budget.spent / budget.monthly_limit) * 100, 100)
                const color = getBudgetColor(budget.spent, budget.monthly_limit)
                return (
                  <View
                    key={budget.id}
                    style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 20 }}>{CATEGORIES.find(c => c.name === budget.category)?.emoji || '💸'}</Text>
                        <Text style={{ color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 }}>{budget.category}</Text>
                      </View>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                        {formatAmount(budget.spent)} / {formatAmount(budget.monthly_limit)}
                      </Text>
                    </View>
                    {/* Progress bar */}
                    <View style={{ height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: color, fontSize: 13, fontWeight: '500' }}>
                        {pct >= 100 ? 'Over budget!' : `${Math.round(100 - pct)}% remaining`}
                      </Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                        {formatAmount(Math.max(budget.remaining, 0))} left
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}>
            {/* Add goal button */}
            <TouchableOpacity
              onPress={() => setShowGoalModal(true)}
              style={{ backgroundColor: COLORS.violet, borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 18 }}>+</Text>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Add savings goal</Text>
            </TouchableOpacity>

            {goals.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
                <Text style={{ fontSize: 40 }}>🎯</Text>
                <Text style={{ color: COLORS.textMuted, textAlign: 'center', fontSize: 15 }}>
                  No savings goals yet.{'\n'}Set a goal and track your progress.
                </Text>
              </View>
            ) : (
              goals.map(goal => {
                const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100)
                return (
                  <View
                    key={goal.id}
                    style={{ backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 10 }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: COLORS.textPrimary, fontWeight: '600', fontSize: 15 }}>{goal.goal_name}</Text>
                      <Text style={{ color: COLORS.violet, fontWeight: '600', fontSize: 14 }}>
                        {Math.round(pct)}%
                      </Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: COLORS.violet, borderRadius: 4 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                        {formatAmount(goal.current_amount)} saved
                      </Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                        Goal: {formatAmount(goal.target_amount)}
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' }}>Set a budget</Text>

            <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Select category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 48 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.filter(c => !['Income', 'Transfer', 'ATM/Cash'].includes(c.name)).map(cat => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setSelectedCategory(cat.name)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1,
                      backgroundColor: selectedCategory === cat.name ? COLORS.violet : COLORS.bgPrimary,
                      borderColor: selectedCategory === cat.name ? COLORS.violet : COLORS.border,
                    }}
                  >
                    <Text style={{ color: selectedCategory === cat.name ? 'white' : COLORS.textMuted, fontSize: 13 }}>
                      {cat.emoji} {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TextInput
              style={{ backgroundColor: COLORS.bgPrimary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.textPrimary, fontSize: 17, borderWidth: 1, borderColor: COLORS.border }}
              placeholder="Monthly limit (₹)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={budgetLimit}
              onChangeText={setBudgetLimit}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowBudgetModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: COLORS.bgPrimary, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text style={{ color: COLORS.textMuted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createBudget}
                disabled={!selectedCategory || !budgetLimit}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: selectedCategory && budgetLimit ? COLORS.violet : COLORS.border }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Set Budget</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: COLORS.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 16 }}>
            <Text style={{ color: COLORS.textPrimary, fontSize: 20, fontWeight: 'bold' }}>New savings goal</Text>

            <TextInput
              style={{ backgroundColor: COLORS.bgPrimary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.textPrimary, fontSize: 17, borderWidth: 1, borderColor: COLORS.border }}
              placeholder="What are you saving for?"
              placeholderTextColor={COLORS.textMuted}
              value={goalName}
              onChangeText={setGoalName}
              autoCapitalize="words"
            />

            <TextInput
              style={{ backgroundColor: COLORS.bgPrimary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: COLORS.textPrimary, fontSize: 17, borderWidth: 1, borderColor: COLORS.border }}
              placeholder="Target amount (₹)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={goalTarget}
              onChangeText={setGoalTarget}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowGoalModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: COLORS.bgPrimary, borderWidth: 1, borderColor: COLORS.border }}
              >
                <Text style={{ color: COLORS.textMuted, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={createGoal}
                disabled={!goalName || !goalTarget}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: goalName && goalTarget ? COLORS.violet : COLORS.border }}
              >
                <Text style={{ color: 'white', fontWeight: '600' }}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
