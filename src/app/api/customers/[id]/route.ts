import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

// DELETE /api/customers/[id] — remove a customer and their transactions.
// Used by the web cashier (PIN-gated UI) to clean up test/mistaken registrations.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Remove transactions first in case there's no ON DELETE CASCADE on the FK.
  const { error: txErr } = await supabase.from('bonus_transactions').delete().eq('customer_id', id)
  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 })

  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
