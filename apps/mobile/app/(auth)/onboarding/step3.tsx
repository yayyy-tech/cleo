import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { api } from '../../../src/lib/api'
import { useStore } from '../../../src/store/useStore'

export default function Step3() {
  const router = useRouter()
  const { user } = useStore()
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          '*/*',
        ],
        copyToCacheDirectory: true,
      })
      if (result.canceled) return

      const file = result.assets[0]
      setUploading(true)

      const formData = new FormData()
      formData.append(
        'file',
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        } as any
      )

      const { data } = await api.post('/transactions/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUploading(false)
      setUploaded(true)
      Alert.alert(
        '✅ Bank statement imported!',
        `${data.imported} transactions imported. ${data.skipped} duplicates skipped.`,
        [{ text: 'Continue', onPress: () => router.push('/(auth)/onboarding/step4') }]
      )
    } catch (e) {
      setUploading(false)
      Alert.alert('Error', 'Could not upload file. Try again.')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dime-navy px-6">
      <View className="flex-1 justify-center gap-8">

        {/* Header */}
        <View className="gap-2">
          <Text className="text-dime-muted">Step 3 of 5</Text>
          <Text className="text-dime-text font-bold" style={{ fontSize: 28 }}>
            Connect your bank
          </Text>
          <Text className="text-dime-muted" style={{ fontSize: 15, lineHeight: 22 }}>
            Download your bank statement as PDF, Excel or CSV and upload it here. Dime will analyze your spending instantly.
          </Text>
        </View>

        {/* How to get CSV */}
        <View className="bg-dime-card border border-dime-border rounded-2xl p-4 gap-3">
          <Text className="text-dime-text font-semibold" style={{ fontSize: 15 }}>
            How to get your bank statement (PDF, Excel or CSV)
          </Text>
          {[
            { bank: 'HDFC', steps: 'NetBanking → Accounts → Statement → Download Excel/PDF' },
{ bank: 'SBI', steps: 'YONO → eStatement → Select period → PDF/Excel' },
{ bank: 'ICICI', steps: 'iMobile → Accounts → Statement → Export PDF/Excel' },
{ bank: 'Axis', steps: 'Mobile Banking → Statement → Download PDF/Excel' },
{ bank: 'Kotak', steps: 'Net Banking → Account Statement → Excel/PDF' },
          ].map((item) => (
            <View key={item.bank} className="flex-row gap-3">
              <View className="bg-dime-violet rounded-lg px-2 py-1 self-start">
                <Text className="text-white" style={{ fontSize: 12, fontWeight: '600' }}>
                  {item.bank}
                </Text>
              </View>
              <Text className="text-dime-muted flex-1" style={{ fontSize: 13, lineHeight: 18 }}>
                {item.steps}
              </Text>
            </View>
          ))}
        </View>

        {/* Upload button */}
        <View className="gap-3">
          <TouchableOpacity
            onPress={pickAndUpload}
            disabled={uploading}
            className="bg-dime-violet rounded-2xl py-4 items-center flex-row justify-center gap-2"
          >
            {uploading
              ? <ActivityIndicator color="white" />
              : <>
                  <Text style={{ fontSize: 20 }}>📂</Text>
                  <Text className="text-white font-semibold" style={{ fontSize: 17 }}>
                    {uploaded ? 'Upload another file' : 'Upload bank statement'}
                  </Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding/step4')}
            className="items-center py-3"
          >
            <Text className="text-dime-muted" style={{ fontSize: 15 }}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  )
}