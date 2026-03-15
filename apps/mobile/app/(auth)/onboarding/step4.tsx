import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function Step4() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-dime-muted" style={{ fontSize: 14 }}>Step 4 of 5</Text>
          <Text className="text-dime-text font-bold" style={{ fontSize: 28 }}>
            Set your first budget
          </Text>
          <Text className="text-dime-muted" style={{ fontSize: 14 }}>
            You can always change this later. Dime will help you stay on track.
          </Text>
        </View>

        <View className="bg-dime-card border border-dime-border rounded-2xl p-6 items-center gap-3">
          <Text style={{ fontSize: 48 }}>📊</Text>
          <Text className="text-dime-muted text-center" style={{ fontSize: 15 }}>
            Budget setup coming soon.{'\n'}Dime will suggest budgets based on your spending.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/onboarding/step5')}
          className="bg-dime-violet rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-semibold" style={{ fontSize: 17 }}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
