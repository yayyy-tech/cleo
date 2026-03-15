import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { COLORS } from '../../../src/constants/theme'
import SMSPermissionCard from '../../../src/components/shared/SMSPermissionCard'
import { syncSMSHistory } from '../../../src/services/smsSync'
import { PermissionsAndroid, Platform } from 'react-native'

export default function Step4() {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)

  const requestAndSync = async () => {
    if (Platform.OS !== 'android') {
      router.push('/(auth)/onboarding/step5')
      return
    }

    try {
      setSyncing(true)
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS)
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        await syncSMSHistory(365)
      }
    } finally {
      setSyncing(false)
      router.push('/(auth)/onboarding/step5')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dime-navy">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        <View style={{ flex: 1, justifyContent: 'center', gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Text className="text-dime-muted" style={{ fontSize: 14 }}>
              Step 4 of 5
            </Text>
            <Text className="text-dime-text font-bold" style={{ fontSize: 28 }}>
              Never enter transactions manually
            </Text>
            <Text className="text-dime-muted" style={{ fontSize: 14, lineHeight: 22 }}>
              Dime reads your bank SMS automatically. Every UPI payment, every transaction — tracked instantly.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: COLORS.bgCard,
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
              gap: 12,
            }}
          >
            <Text style={{ color: COLORS.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 }}>
              Dime detects from SMS:
            </Text>
            {['UPI payments', 'Bank debits and credits', 'Balance updates', 'EMI deductions'].map((item) => (
              <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16 }}>✓</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>{item}</Text>
              </View>
            ))}
          </View>

          <SMSPermissionCard
            onEnabled={() => {
              router.push('/(auth)/onboarding/step5')
            }}
          />

          <View style={{ marginTop: 8, alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={requestAndSync} disabled={syncing} style={{ width: '100%' }}>
              <View
                style={{
                  backgroundColor: COLORS.violet,
                  borderRadius: 20,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {syncing ? 'Syncing SMS...' : 'Enable SMS tracking'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/onboarding/step5')}>
              <Text className="text-dime-muted" style={{ fontSize: 15 }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
