import { NextRequest, NextResponse } from 'next/server'
import { supabase, STAMP_CARDS, isStampCategory, stampRewardReady, type StampCategory } from '@/lib/supabase'

// Supabase queries use fetch, which Next.js caches by default in route handlers
// that don't touch the request object. Force fresh reads/writes.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// POST /api/customers/[id]/stamp
//   body { action: "add" }                      → +1 stamp (capped at target)
//   body { action: "redeem" }                   → reward given, reset to 0
//   body { action: "switch", category: "..." }  → change card, reset to 0
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { action, category } = await req.json()

  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !customer) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let newCategory: StampCategory | null = customer.stamp_category
  let newCount = customer.stamp_count ?? 0

  if (action === 'switch') {
    if (!isStampCategory(category)) return NextResponse.json({ error: 'bad_category' }, { status: 400 })
    newCategory = category
    newCount = 0 // switching resets progress (no free first stamp — that's registration-only)
  } else if (action === 'redeem') {
    if (!stampRewardReady(customer.stamp_category, newCount)) {
      return NextResponse.json({ error: 'reward_not_ready' }, { status: 400 })
    }
    newCount = 0
  } else if (action === 'add') {
    if (!customer.stamp_category) return NextResponse.json({ error: 'no_card' }, { status: 400 })
    const target = STAMP_CARDS[customer.stamp_category as StampCategory].target
    // Don't exceed target — cashier must redeem the reward before stamping again.
    if (newCount < target) newCount = newCount + 1
  } else {
    return NextResponse.json({ error: 'bad_action' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ stamp_category: newCategory, stamp_count: newCount })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
