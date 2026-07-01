import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
  const { phone, name } = await req.json()
  if (!phone || !name) return NextResponse.json({ error: 'phone and name required' }, { status: 400 })

  const digits = phone.replace(/\D/g, '')
  const { data, error } = await supabase
    .from('customers')
    .insert({ phone: digits, name, level: 'nan', total_spent: 0, bonus_balance: 0 })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'already_exists' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
