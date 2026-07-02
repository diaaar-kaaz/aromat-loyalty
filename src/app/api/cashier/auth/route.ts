import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { pin } = await req.json()
  // Trim to tolerate stray spaces/newlines in the env value. Fail closed if unset.
  const expected = (process.env.CASHIER_PIN ?? '').trim()
  if (!expected || String(pin ?? '').trim() !== expected) {
    return NextResponse.json({ error: 'Неверный PIN' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
