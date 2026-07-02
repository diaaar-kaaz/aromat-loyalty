import { NextResponse } from 'next/server'
import { LEVELS, STAMP_CARDS } from '@/lib/supabase'

// Single source of truth for tunable numbers. The iOS app fetches this at launch,
// so percentages / thresholds / stamp targets can change with a web deploy only —
// no App Store update needed. Edit LEVELS / STAMP_CARDS in lib/supabase.ts to change.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  const levels = Object.fromEntries(
    Object.entries(LEVELS).map(([key, v]) => [key, { threshold: v.threshold, percent: v.percent }])
  )
  const stampTargets = Object.fromEntries(
    Object.entries(STAMP_CARDS).map(([key, v]) => [key, v.target])
  )
  return NextResponse.json({ levels, stampTargets })
}
