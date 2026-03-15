import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'

export default function Step2() {
  const router = useRouter()
  const [income, setIncome] = useState('')

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 justify-center gap-8">
        <View className="gap-2">
          <Text className="text-dime-muted" style={{ fontSize: 14 }}>Step 2 of 5</Text>
          <Text className="text-dime-text font-bold" style={{ fontSize: 28 }}>
            What's your monthly take-home?
          </Text>
          <Text className="text-dime-muted" style={{ fontSize: 14 }}>
            Approximate is fine. This helps Dime give better advice.
          </Text>
        </View>
        <View className="flex-row items-center bg-dime-card border border-dime-border rounded-2xl px-4 py-4 gap-2">
          <Text className="text-dime-muted font-medium" style={{ fontSize: 20 }}>₹</Text>
          <TextInput
            className="flex-1 text-dime-text"
            style={{ fontSize: 20 }}
            placeholder="50,000"
            placeholderTextColor="#374151"
            keyboardType="numeric"
            value={income}
            onChangeText={setIncome}
            autoFocus
          />
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(auth)/onboarding/step3')}
          className="bg-dime-violet rounded-2xl py-4 items-center"
        >
          <Text className="text-white font-semibold" style={{ fontSize: 17 }}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/onboarding/step3')}>
          <Text className="text-dime-muted text-center" style={{ fontSize: 15 }}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
