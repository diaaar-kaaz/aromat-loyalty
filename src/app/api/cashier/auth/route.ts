import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  if (pin !== process.env.CASHIER_PIN) {
    return NextResponse.json({ error: 'Неверный PIN' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
