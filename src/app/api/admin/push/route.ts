import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendPush, isDeadToken, type ApnsEnvironment, type PushResult } from '@/lib/apns'

// node:http2 недоступен в Edge-рантайме, а рассылка на всю базу дольше
// дефолтных 10 секунд.
export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

// Сколько устройств получит рассылку — показываем в приложении перед отправкой.
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { count, error } = await supabase
    .from('device_tokens')
    .select('token', { count: 'exact', head: true })
    .eq('enabled', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recipients: count ?? 0 })
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  const text = typeof body?.body === 'string' ? body.body.trim() : ''

  if (!title || !text) {
    return NextResponse.json({ error: 'title_and_body_required' }, { status: 400 })
  }
  // Длинный текст всё равно обрежется системой в баннере — не пускаем дальше,
  // чтобы отправитель видел проблему до рассылки, а не после.
  if (title.length > 60 || text.length > 180) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('device_tokens')
    .select('token, environment')
    .eq('enabled', true)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const tokens = data ?? []
  if (tokens.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, recipients: 0 })
  }

  // Sandbox- и production-токены живут на разных хостах Apple и не
  // взаимозаменяемы, поэтому шлём двумя отдельными пачками.
  const byEnv: Record<ApnsEnvironment, string[]> = { production: [], sandbox: [] }
  for (const row of tokens) {
    byEnv[row.environment === 'sandbox' ? 'sandbox' : 'production'].push(row.token)
  }

  const results: PushResult[] = []
  try {
    for (const environment of ['production', 'sandbox'] as ApnsEnvironment[]) {
      const list = byEnv[environment]
      if (list.length === 0) continue
      results.push(...await sendPush({ tokens: list, environment, title, body: text }))
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'apns_failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Мёртвые токены (приложение удалено) чистим сразу — иначе с каждой
  // рассылкой доля бесполезных запросов растёт.
  const dead = results.filter(r => !r.ok && isDeadToken(r.reason)).map(r => r.token)
  if (dead.length > 0) {
    await supabase.from('device_tokens').delete().in('token', dead)
  }

  const sent = results.filter(r => r.ok).length
  const failures = results.filter(r => !r.ok)

  return NextResponse.json({
    sent,
    failed: failures.length,
    recipients: results.length,
    removed: dead.length,
    // Первые несколько причин — чтобы в приложении было видно, что именно сломалось.
    errors: failures
      .map(f => f.reason ?? 'unknown')
      .filter((reason, i, all) => all.indexOf(reason) === i)
      .slice(0, 5),
  })
}
