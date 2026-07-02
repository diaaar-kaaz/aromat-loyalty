import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Supabase queries use fetch under the hood, which Next.js caches by default.
// Force fully dynamic + no fetch caching so history is always read fresh from the DB.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('bonus_transactions')
    .select('*')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
