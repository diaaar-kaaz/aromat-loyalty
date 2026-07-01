import { NextRequest, NextResponse } from 'next/server'
import { supabase, getLevel, calcEarnedBonus } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { customer_id, order_amount, spend_bonus } = await req.json()

  if (!customer_id || !order_amount) {
    return NextResponse.json({ error: 'customer_id and order_amount required' }, { status: 400 })
  }

  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customer_id)
    .single()

  if (fetchError || !customer) return NextResponse.json({ error: 'customer not found' }, { status: 404 })

  const spendAmount = Math.min(spend_bonus || 0, customer.bonus_balance, Math.floor(order_amount * 0.2))
  const earnAmount = calcEarnedBonus(order_amount, customer.level)

  const newTotalSpent = customer.total_spent + order_amount
  const newBalance = customer.bonus_balance - spendAmount + earnAmount
  const newLevel = getLevel(newTotalSpent)

  const transactions = []
  if (spendAmount > 0) {
    transactions.push({ customer_id, amount: spendAmount, type: 'spend', note: `Чек ${order_amount} тг` })
  }
  transactions.push({ customer_id, amount: earnAmount, type: 'earn', note: `Чек ${order_amount} тг` })

  const { error: txError } = await supabase.from('bonus_transactions').insert(transactions)
  if (txError) return NextResponse.json({ error: txError.message }, { status: 500 })

  const { error: updateError } = await supabase
    .from('customers')
    .update({ bonus_balance: newBalance, total_spent: newTotalSpent, level: newLevel })
    .eq('id', customer_id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ earned: earnAmount, spent: spendAmount, new_balance: newBalance, new_level: newLevel })
}
