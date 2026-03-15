import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SplashScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-dime-navy">
      <LinearGradient
        colors={['#0A0E1A', '#1A0A2E', '#0A0E1A']}
        className="flex-1 items-center justify-between px-6 py-12"
      >
        {/* Logo area */}
        <View className="flex-1 items-center justify-center gap-4">
          <View className="w-20 h-20 rounded-2xl bg-dime-violet items-center justify-center">
            <Text style={{ fontSize: 40 }}>🪙</Text>
          </View>
          <Text className="text-dime-text font-bold" style={{ fontSize: 48 }}>
            Dime
          </Text>
          <Text className="text-dime-muted text-center" style={{ fontSize: 16 }}>
            Your financially sharp{'\n'}best friend
          </Text>
        </View>

        {/* Bottom CTA */}
        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            className="w-full bg-dime-violet rounded-2xl py-4 items-center"
          >
            <Text className="text-white font-semibold" style={{ fontSize: 17 }}>
              Get started
            </Text>
          </TouchableOpacity>
          <Text className="text-dime-muted text-center text-xs">
            By continuing you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}
