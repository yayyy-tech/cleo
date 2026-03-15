/* eslint-disable @typescript-eslint/no-var-requires */
import { PermissionsAndroid, Platform } from 'react-native'
import { api } from '../lib/api'
import { parseSMS, ParsedTransaction } from './smsParser'

let SmsAndroid: any
try {
  // react-native-get-sms-android is Android-only and may not exist in web/iOS
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SmsAndroid = require('react-native-get-sms-android')
} catch {
  SmsAndroid = null
}

const BANK_SENDER_IDS = [
  'HDFCBK',
  'SBIINB',
  'ICICIB',
  'AXISBK',
  'KOTAKB',
  'INDBNK',
  'PNBSMS',
  'BOIIND',
  'YESBNK',
  'IDFCBK',
  'ATMSBI',
  'CENTBK',
  'CANBNK',
  'SBIPSG',
  'UCOBNK',
  'SYNBNK',
  'IDBIBANK',
]

let smsListenerAttached = false

export async function syncSMSHistory(daysBack: number = 365): Promise<number> {
  if (Platform.OS !== 'android' || !SmsAndroid) {
    return 0
  }

  const hasPermission = await ensureSmsPermission()
  if (!hasPermission) return 0

  const since = Date.now() - daysBack * 24 * 60 * 60 * 1000

  const filter = {
    box: 'inbox',
    minDate: since,
    maxDate: Date.now(),
    indexFrom: 0,
    maxCount: 1000,
  }

  return new Promise<number>((resolve) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail: string) => {
        console.warn('SMS list failed', fail)
        resolve(0)
      },
      async (count: number, smsList: string) => {
        try {
          const messages: Array<{ body: string; date: number; address: string }> = JSON.parse(smsList)
          const bankMessages = messages.filter((m) =>
            BANK_SENDER_IDS.some((id) => (m.address || '').toUpperCase().includes(id)),
          )

          const parsed: ParsedTransaction[] = []
          for (const msg of bankMessages) {
            const txn = parseSMS(msg.body, new Date(msg.date))
            if (txn) parsed.push(txn)
          }

          if (parsed.length === 0) {
            resolve(0)
            return
          }

          await api.post('/transactions/sync-sms', { transactions: parsed })
          resolve(parsed.length)
        } catch (e) {
          console.warn('Failed to sync SMS history', e)
          resolve(0)
        }
      },
    )
  })
}

export function startSMSListener(onNew: (txn: ParsedTransaction) => void): void {
  if (Platform.OS !== 'android' || !SmsAndroid) return
  if (smsListenerAttached) return

  ensureSmsPermission().then((granted) => {
    if (!granted) return

    try {
      SmsAndroid.addListener((message: { body: string; date: number; address: string }) => {
        if (!BANK_SENDER_IDS.some((id) => (message.address || '').toUpperCase().includes(id))) {
          return
        }
        const parsed = parseSMS(message.body, new Date(message.date))
        if (parsed) onNew(parsed)
      })
      smsListenerAttached = true
    } catch (e) {
      console.warn('Failed to attach SMS listener', e)
    }
  })
}

export function stopSMSListener(): void {
  if (!SmsAndroid || !smsListenerAttached) return
  try {
    SmsAndroid.removeListener()
  } catch {
    // ignore
  }
  smsListenerAttached = false
}

export async function ensureSmsPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return false
  if (!SmsAndroid) return false

  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS)
    return granted === PermissionsAndroid.RESULTS.GRANTED
  } catch (e) {
    console.warn('SMS permission request failed', e)
    return false
  }
}

