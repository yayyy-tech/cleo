import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { supabase } from '../../src/lib/supabase'

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      // Try sign up if login fails
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        Alert.alert('Error', signUpError.message)
      } else {
        router.replace('/(auth)/onboarding/step1')
      }
    } else {
      router.replace('/(auth)/onboarding/step1')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-dime-text font-bold" style={{ fontSize: 32 }}>
            Welcome to Dime
          </Text>
          <Text className="text-dime-muted" style={{ fontSize: 16 }}>
            Sign in or create an account
          </Text>
        </View>

        <View className="gap-4">
          <TextInput
            className="bg-dime-card border border-dime-border rounded-2xl px-4 py-4 text-dime-text"
            style={{ fontSize: 17 }}
            placeholder="Email address"
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            autoFocus
          />
          <TextInput
            className="bg-dime-card border border-dime-border rounded-2xl px-4 py-4 text-dime-text"
            style={{ fontSize: 17 }}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading || !email || !password}
          className={`rounded-2xl py-4 items-center ${email && password ? 'bg-dime-violet' : 'bg-dime-card'}`}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-semibold" style={{ fontSize: 17 }}>
                Continue
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}