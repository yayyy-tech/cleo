import { parse } from 'date-fns'

export type ParsedTransactionType = 'DEBIT' | 'CREDIT'

export interface ParsedTransaction {
  amount: number
  type: ParsedTransactionType
  account: string | null
  upiId: string | null
  merchantName: string | null
  date: Date
  balance: number | null
  bank: string | null
  rawSMS: string
}

const MERCHANT_LOOKUP: Record<string, string> = {
  swiggy: 'Swiggy',
  zomato: 'Zomato',
  uber: 'Uber',
  ola: 'Ola',
  rapido: 'Rapido',
  netflix: 'Netflix',
  spotify: 'Spotify',
  amazon: 'Amazon',
  flipkart: 'Flipkart',
  myntra: 'Myntra',
  blinkit: 'Blinkit',
  zepto: 'Zepto',
  bigbasket: 'BigBasket',
  irctc: 'IRCTC',
  phonepe: 'PhonePe',
  gpay: 'Google Pay',
  paytm: 'Paytm',
  namma: 'Namma Metro',
  dunzo: 'Dunzo',
  cred: 'CRED',
}

const DATE_FORMATS = ['dd/MM/yyyy', 'dd-MM-yyyy', 'dd MMM yyyy']

function parseAmount(text: string | null): number | null {
  if (!text) return null
  const cleaned = text.replace(/[,₹\s]/g, '').trim()
  const value = parseFloat(cleaned)
  if (isNaN(value)) return null
  return Math.round(value * 100)
}

function parseDateFromText(fallback: Date, body: string): Date {
  for (const fmt of DATE_FORMATS) {
    const match = body.match(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/) || body.match(/\b\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}\b/)
    if (match) {
      const d = parse(match[0], fmt, fallback)
      if (!isNaN(d.getTime())) return d
    }
  }
  return fallback
}

function extractAccount(body: string): string | null {
  const m = body.match(/(?:a\/c|acct|account|ACCT|A\/c).*?(\d{4})\b/)
  return m ? m[1] : null
}

function extractUpiId(body: string): string | null {
  const m = body.match(/\b[\w.\-]+@[\w]+\b/)
  return m ? m[0] : null
}

function extractMerchantFromUpi(upiId: string | null): string | null {
  if (!upiId) return null
  const lower = upiId.toLowerCase()
  for (const key of Object.keys(MERCHANT_LOOKUP)) {
    if (lower.includes(key)) return MERCHANT_LOOKUP[key]
  }
  return null
}

function extractBalance(body: string): number | null {
  const m =
    body.match(/(?:bal|balance)[^₹\d]*([₹]?\s*\d[\d,]*\.?\d*)/i) ||
    body.match(/avl bal[^₹\d]*([₹]?\s*\d[\d,]*\.?\d*)/i)
  return m ? parseAmount(m[1]) : null
}

function detectType(body: string): ParsedTransactionType | null {
  const lower = body.toLowerCase()
  if (/(debited|debit|spent|purchase|paid|withdrawn|dr\b)/.test(lower)) return 'DEBIT'
  if (/(credited|credit|received|cr\b|deposit)/.test(lower)) return 'CREDIT'
  return null
}

function extractAmount(body: string): number | null {
  const m =
    body.match(/(?:rs\.?|inr|amount)[^₹\d]*([₹]?\s*\d[\d,]*\.?\d*)/i) ||
    body.match(/([₹]\s*\d[\d,]*\.?\d*)/)
  return m ? parseAmount(m[1]) : null
}

function baseParse(
  bank: string,
  body: string,
  smsDate: Date,
  overrides: Partial<Omit<ParsedTransaction, 'rawSMS' | 'date'>> = {}
): ParsedTransaction | null {
  const type = overrides.type || detectType(body)
  const amount = overrides.amount ?? extractAmount(body)
  if (!type || amount == null || amount <= 0) return null

  const account = overrides.account ?? extractAccount(body)
  const upiId = overrides.upiId ?? extractUpiId(body)
  const merchantName = overrides.merchantName ?? extractMerchantFromUpi(upiId)
  const balance = overrides.balance ?? extractBalance(body)
  const date = parseDateFromText(smsDate, body)

  return {
    amount,
    type,
    account: account || null,
    upiId,
    merchantName,
    date,
    balance,
    bank,
    rawSMS: body,
  }
}

function parseHdfc(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/HDFC/i.test(body)) return null
  return baseParse('HDFC', body, smsDate, {})
}

function parseSbi(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/(SBI|State Bank of India)/i.test(body)) return null
  return baseParse('SBI', body, smsDate, {})
}

function parseIcici(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/ICICI/i.test(body)) return null
  return baseParse('ICICI', body, smsDate, {})
}

function parseAxis(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/AXIS/i.test(body)) return null
  return baseParse('Axis', body, smsDate, {})
}

function parseKotak(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/KOTAK/i.test(body)) return null
  return baseParse('Kotak', body, smsDate, {})
}

function parseGenericUpi(body: string, smsDate: Date): ParsedTransaction | null {
  if (!/upi/i.test(body)) return null
  return baseParse('UPI', body, smsDate, {})
}

export function parseSMS(smsBody: string, smsDate: Date): ParsedTransaction | null {
  const body = smsBody.trim()
  if (!body) return null

  const parsers = [parseHdfc, parseSbi, parseIcici, parseAxis, parseKotak, parseGenericUpi]

  for (const parser of parsers) {
    const parsed = parser(body, smsDate)
    if (parsed) return parsed
  }

  return null
}

