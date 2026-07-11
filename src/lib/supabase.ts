import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type StampCategory = 'coffee' | 'pastry' | 'dessert'

export type Customer = {
  id: string
  phone: string
  name: string
  level: 'nan' | 'kumis' | 'altyn' | 'vip'
  total_spent: number
  bonus_balance: number
  stamp_category: StampCategory | null
  stamp_count: number
  created_at: string
}

// Punch-card config. target = stamps to collect; the (target+1)-th item is free.
export const STAMP_CARDS: Record<StampCategory, { icon: string; label: string; labelKz: string; target: number }> = {
  coffee:  { icon: '☕', label: 'Кофе',    labelKz: 'Кофе',   target: 6 },
  pastry:  { icon: '🥐', label: 'Выпечка', labelKz: 'Тоқаш',  target: 8 },
  dessert: { icon: '🍰', label: 'Десерт',  labelKz: 'Десерт', target: 8 },
}

export function isStampCategory(v: unknown): v is StampCategory {
  return v === 'coffee' || v === 'pastry' || v === 'dessert'
}

export function stampRewardReady(category: StampCategory | null, count: number): boolean {
  if (!category) return false
  return count >= STAMP_CARDS[category].target
}

export type BonusTransaction = {
  id: string
  customer_id: string
  amount: number
  type: 'earn' | 'spend'
  note: string
  created_at: string
}

export const LEVELS = {
  nan:   { label: 'Нан',          labelKz: 'Нан',     threshold: 0,       percent: 1,  color: '#8B7355' },
  kumis: { label: 'Күміс',        labelKz: 'Күміс',   threshold: 20000,   percent: 2,  color: '#A8A9AD' },
  altyn: { label: 'Алтын',        labelKz: 'Алтын',   threshold: 50000,   percent: 3,  color: '#C9A84C' },
  vip:   { label: 'VIP Aromat',   labelKz: 'VIP',     threshold: 100000,  percent: 5,  color: '#C46245' },
}

export function getLevel(totalSpent: number): Customer['level'] {
  if (totalSpent >= 100000) return 'vip'
  if (totalSpent >= 50000) return 'altyn'
  if (totalSpent >= 20000) return 'kumis'
  return 'nan'
}

export function getNextLevelThreshold(level: Customer['level']): number | null {
  if (level === 'nan') return 20000
  if (level === 'kumis') return 50000
  if (level === 'altyn') return 100000
  return null
}

export function calcEarnedBonus(amount: number, level: Customer['level']): number {
  return Math.floor(amount * LEVELS[level].percent / 100)
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return phone
}
