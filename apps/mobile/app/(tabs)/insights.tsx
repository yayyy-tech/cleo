import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function InsightsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-dime-navy" edges={['top']}>
      <View className="px-4 py-4">
        <Text className="text-dime-text font-bold" style={{ fontSize: 24 }}>Insights</Text>
        <Text className="text-dime-muted" style={{ fontSize: 14 }}>What Dime noticed</Text>
      </View>
      <View className="flex-1 items-center justify-center gap-3">
        <Text style={{ fontSize: 40 }}>✨</Text>
        <Text className="text-dime-muted text-center" style={{ fontSize: 15 }}>
          Insights will appear here{'\n'}after Dime analyzes your spending
        </Text>
      </View>
    </SafeAreaView>
  )
}
