import { NextRequest, NextResponse } from 'next/server'
import { supabase, isStampCategory } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  const digits = phone.replace(/\D/g, '')
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', digits)
    .single()

  if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { phone, name, stamp_category } = await req.json()
  if (!phone || !name) return NextResponse.json({ error: 'phone and name required' }, { status: 400 })

  // Chosen at registration only. First stamp is free (start at 1) as an acquisition hook.
  const category = isStampCategory(stamp_category) ? stamp_category : null
  const stampCount = category ? 1 : 0

  const digits = phone.replace(/\D/g, '')
  const { data, error } = await supabase
    .from('customers')
    .insert({
      phone: digits, name, level: 'nan', total_spent: 0, bonus_balance: 0,
      stamp_category: category, stamp_count: stampCount,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'already_exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
