import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const password = req.headers.get('x-admin-password')
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const [customersRes, txRes, topRes] = await Promise.all([
    supabase.from('customers').select('id, level, bonus_balance, total_spent, name, phone, created_at'),
    supabase.from('bonus_transactions').select('type, amount'),
    supabase.from('customers').select('name, phone, total_spent, bonus_balance, level').order('total_spent', { ascending: false }).limit(10),
  ])

  const customers = customersRes.data || []
  const transactions = txRes.data || []

  const totalEarned = transactions.filter(t => t.type === 'earn').reduce((s, t) => s + t.amount, 0)
  const totalSpent = transactions.filter(t => t.type === 'spend').reduce((s, t) => s + t.amount, 0)

  const byLevel = { nan: 0, kumis: 0, altyn: 0, vip: 0 }
  customers.forEach(c => { byLevel[c.level as keyof typeof byLevel]++ })

  return NextResponse.json({
    total_customers: customers.length,
    total_earned_bonus: totalEarned,
    total_spent_bonus: totalSpent,
    by_level: byLevel,
    top_customers: topRes.data || [],
  })
}
