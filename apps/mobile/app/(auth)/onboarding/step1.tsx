import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'

export default function Step1() {
  const router = useRouter()
  const [name, setName] = useState('')

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-dime-muted" style={{ fontSize: 14 }}>Step 1 of 5</Text>
          <Text className="text-dime-text font-bold" style={{ fontSize: 28 }}>
            What should I call you?
          </Text>
        </View>
        <TextInput
          className="bg-dime-card border border-dime-border rounded-2xl px-4 py-4 text-dime-text"
          style={{ fontSize: 17 }}
          placeholder="Your first name"
          placeholderTextColor="#6B7280"
          value={name}
          onChangeText={setName}
          autoFocus
          autoCapitalize="words"
        />
        <TouchableOpacity
          onPress={() => router.push('/(auth)/onboarding/step2')}
          disabled={!name.trim()}
          className={`rounded-2xl py-4 items-center ${name.trim() ? 'bg-dime-violet' : 'bg-dime-card'}`}
        >
          <Text className="text-white font-semibold" style={{ fontSize: 17 }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
