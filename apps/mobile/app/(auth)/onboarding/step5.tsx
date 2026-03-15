import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export default function Step5() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 items-center justify-center gap-6">
        <View className="w-24 h-24 rounded-3xl bg-dime-violet items-center justify-center">
          <Text style={{ fontSize: 56 }}>🪙</Text>
        </View>

        <View className="bg-dime-card border border-dime-border rounded-2xl p-5 mx-4 max-w-sm">
          <Text className="text-dime-text" style={{ fontSize: 17, lineHeight: 26 }}>
            Hey! I'm Dime 👋{'\n\n'}I've been waiting for you. Let's sort your money out.
          </Text>
        </View>

        <Text className="text-dime-muted text-center" style={{ fontSize: 14 }}>
          I'll help you track spending, save money,{'\n'}and roast your bad habits 🔥
        </Text>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/chat')}
          className="bg-dime-violet rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-semibold" style={{ fontSize: 17 }}>
            Let's go →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
