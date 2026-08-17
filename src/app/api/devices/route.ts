import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Регистрация устройства для пуш-уведомлений. Приложение зовёт этот эндпоинт
// при каждом запуске: APNs может выдать новый токен после переустановки,
// восстановления из бэкапа или смены устройства.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { token, phone, enabled, environment, app_version } = body

  // APNs-токен — ровно 64 hex-символа. Проверяем формат, иначе в базу
  // натечёт мусор, на который рассылка будет вечно получать BadDeviceToken.
  if (typeof token !== 'string' || !/^[0-9a-fA-F]{64}$/.test(token)) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 400 })
  }

  const env = environment === 'sandbox' ? 'sandbox' : 'production'

  // Приложение знает телефон клиента, а не его UUID — сопоставляем здесь.
  // Незарегистрированный клиент тоже получает пуши: customer_id остаётся null.
  let customerId: string | null = null
  if (typeof phone === 'string' && phone) {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone.replace(/\D/g, ''))
      .single()
    customerId = data?.id ?? null
  }

  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        token: token.toLowerCase(),
        customer_id: customerId,
        platform: 'ios',
        enabled: enabled !== false,
        environment: env,
        app_version: typeof app_version === 'string' ? app_version : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Отписка: клиент выключил тумблер «Уведомления о свежей выпечке».
// Токен не удаляем — вернёт тумблер обратно, и всё заработает без перерегистрации.
export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { error } = await supabase
    .from('device_tokens')
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq('token', token.toLowerCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
