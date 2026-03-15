import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { COLORS } from '../../src/constants/theme'
import { useStore } from '../../src/store/useStore'

function TabIcon({ emoji, label, focused }: { emoji: string, label: string, focused: boolean }) {
  return (
    <View className="items-center gap-0.5 pt-1">
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>{emoji}</Text>
      <Text style={{
        fontSize: 10,
        color: focused ? COLORS.violet : COLORS.textMuted,
        fontWeight: focused ? '600' : '400'
      }}>
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const { unreadInsightCount } = useStore()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D1117',
          borderTopColor: '#1F2937',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💬" label="Dime" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✨" label="Insights" focused={focused} />
          ),
          tabBarBadge: unreadInsightCount > 0 ? unreadInsightCount : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.violet },
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="💳" label="Wallet" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🎯" label="Goals" focused={focused} />
          ),
        }}
      />
    </Tabs>
  )
}
