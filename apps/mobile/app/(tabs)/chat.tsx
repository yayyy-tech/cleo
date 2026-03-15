import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { PermissionsAndroid, Platform } from 'react-native'
import { syncSMSHistory } from '../../src/services/smsSync'

export default function ChatScreen() {
  useEffect(() => {
    const maybeSyncSms = async () => {
      if (Platform.OS !== 'android') return

      const perm = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS)
      if (!perm) return

      const key = 'dime:lastSmsSync'
      const last = await AsyncStorage.getItem(key)
      const now = Date.now()

      if (last) {
        const lastTs = Number(last)
        const diffMs = now - lastTs
        if (diffMs < 60 * 60 * 1000) {
          return
        }
        const daysBack = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)))
        await syncSMSHistory(daysBack)
      } else {
        await syncSMSHistory(30)
      }

      await AsyncStorage.setItem(key, String(now))
    }

    void maybeSyncSms()
  }, [])
  return (
    <SafeAreaView className="flex-1 bg-dime-navy" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dime-border">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-dime-violet items-center justify-center">
            <Text style={{ fontSize: 20 }}>🪙</Text>
          </View>
          <View>
            <Text className="text-dime-text font-semibold" style={{ fontSize: 16 }}>Dime</Text>
            <Text className="text-dime-green" style={{ fontSize: 12 }}>Online</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-dime-card border border-dime-border rounded-xl px-3 py-2">
          <Text style={{ fontSize: 16 }}>🔥 Roast me</Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      <View className="flex-1 items-center justify-center gap-4 px-8">
        <Text style={{ fontSize: 48 }}>🪙</Text>
        <Text className="text-dime-text font-semibold text-center" style={{ fontSize: 20 }}>
          Hey! I'm Dime
        </Text>
        <Text className="text-dime-muted text-center" style={{ fontSize: 15, lineHeight: 22 }}>
          Ask me anything about your money. "How much did I spend on Swiggy?" "Can I afford a trip this month?"
        </Text>
      </View>

      {/* Input bar placeholder */}
      <View className="px-4 pb-6 pt-3 border-t border-dime-border">
        <View className="flex-row items-center bg-dime-card border border-dime-border rounded-2xl px-4 py-3 gap-3">
          <Text className="flex-1 text-dime-muted" style={{ fontSize: 16 }}>
            Ask Dime anything...
          </Text>
          <Text style={{ fontSize: 22 }}>🎤</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
