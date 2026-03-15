import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { PermissionsAndroid, Platform, Alert } from 'react-native'
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '../../constants/theme'
import { syncSMSHistory } from '../../services/smsSync'

interface Props {
  onEnabled?: () => void
}

export const SMSPermissionCard: React.FC<Props> = ({ onEnabled }) => {
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  const requestPermission = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not supported', 'SMS tracking is only available on Android.')
      return
    }

    try {
      setLoading(true)
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS)

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setDenied(false)
        const synced = await syncSMSHistory(365)
        if (synced > 0) {
          Alert.alert('SMS tracking enabled', `Imported ${synced} transactions from your SMS history.`)
        }
        onEnabled?.()
      } else {
        setDenied(true)
      }
    } catch (e) {
      console.warn('SMS permission error', e)
      setDenied(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View
      style={{
        backgroundColor: COLORS.bgCard,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.sm,
      }}
    >
      <Text style={{ color: COLORS.textPrimary, fontSize: FONT_SIZE.lg, fontWeight: '600' }}>
        Allow SMS tracking
      </Text>
      <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.sm, lineHeight: 20 }}>
        Allow Dime to read your bank SMS for automatic transaction tracking. No SMS data is ever shared.
      </Text>

      <TouchableOpacity
        onPress={requestPermission}
        disabled={loading}
        style={{
          marginTop: SPACING.sm,
          backgroundColor: COLORS.violet,
          borderRadius: BORDER_RADIUS.md,
          paddingVertical: 10,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: 'white', fontSize: FONT_SIZE.md, fontWeight: '600' }}>
            Enable automatic tracking
          </Text>
        )}
      </TouchableOpacity>

      {denied && (
        <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs, marginTop: SPACING.xs }}>
          You can enable this later in Settings.
        </Text>
      )}
    </View>
  )
}

export default SMSPermissionCard

