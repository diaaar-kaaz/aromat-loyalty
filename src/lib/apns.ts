import { createPrivateKey, sign } from 'node:crypto'
import http2 from 'node:http2'

// Отправка пушей в Apple Push Notification service.
// Работает только в Node-рантайме (нужен node:http2) — не Edge.

const HOSTS = {
  production: 'https://api.push.apple.com',
  sandbox: 'https://api.sandbox.push.apple.com',
} as const

export type ApnsEnvironment = keyof typeof HOSTS
export type PushResult = { token: string; ok: boolean; reason?: string }

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`missing_env:${name}`)
  return v
}

let cached: { jwt: string; issuedAt: number } | null = null

// Provider-токен: JWT, подписанный ключом .p8. Apple разрешает жить ему час,
// но обновлять чаще раза в 20 минут запрещает (TooManyProviderTokenUpdates),
// поэтому кэшируем на 50 минут — тёплый инстанс переиспользует один токен.
function providerToken(): string {
  const now = Math.floor(Date.now() / 1000)
  if (cached && now - cached.issuedAt < 50 * 60) return cached.jwt

  const header = b64url(JSON.stringify({ alg: 'ES256', kid: requireEnv('APNS_KEY_ID') }))
  const payload = b64url(JSON.stringify({ iss: requireEnv('APNS_TEAM_ID'), iat: now }))
  const signingInput = `${header}.${payload}`

  // В переменных окружения Vercel переводы строк часто хранятся как \n —
  // без разворачивания createPrivateKey не распознает PEM.
  const privateKey = requireEnv('APNS_PRIVATE_KEY').replace(/\\n/g, '\n')

  // ES256 в JWT — «сырая» подпись R||S (P1363). Node по умолчанию отдаёт DER,
  // и APNs на неё отвечает InvalidProviderToken. dsaEncoding решает это.
  const signature = sign('sha256', Buffer.from(signingInput), {
    key: createPrivateKey(privateKey),
    dsaEncoding: 'ieee-p1363',
  })

  const jwt = `${signingInput}.${signature.toString('base64url')}`
  cached = { jwt, issuedAt: now }
  return jwt
}

function b64url(s: string): string {
  return Buffer.from(s).toString('base64url')
}

export async function sendPush(opts: {
  tokens: string[]
  environment: ApnsEnvironment
  title: string
  body: string
}): Promise<PushResult[]> {
  const { tokens, environment, title, body } = opts
  if (tokens.length === 0) return []

  const jwt = providerToken()
  const bundleId = requireEnv('APNS_BUNDLE_ID')
  const payload = JSON.stringify({
    aps: {
      alert: { title, body },
      sound: 'default',
      'interruption-level': 'active',
    },
  })

  const client = http2.connect(HOSTS[environment])
  const results: PushResult[] = []

  // Обработчик ошибки вешаем сразу: без него обрыв соединения роняет процесс,
  // а не возвращает ошибку. 'connect' мог успеть сработать — проверяем флаг.
  const connected = new Promise<void>((resolve, reject) => {
    client.once('error', reject)
    if (client.connecting) client.once('connect', () => resolve())
    else resolve()
  })

  try {
    await connected

    // Одна HTTP/2-сессия мультиплексирует все запросы. Пачками по 50, чтобы
    // не упереться в лимит одновременных стримов при большой базе клиентов.
    for (let i = 0; i < tokens.length; i += 50) {
      const chunk = tokens.slice(i, i + 50)
      const batch = await Promise.all(
        chunk.map(token => sendOne(client, { token, jwt, bundleId, payload }))
      )
      results.push(...batch)
    }
  } finally {
    client.close()
  }

  return results
}

function sendOne(
  client: http2.ClientHttp2Session,
  opts: { token: string; jwt: string; bundleId: string; payload: string }
): Promise<PushResult> {
  const { token, jwt, bundleId, payload } = opts

  return new Promise<PushResult>(resolve => {
    const req = client.request({
      ':method': 'POST',
      ':path': `/3/device/${token}`,
      authorization: `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      // Свежая выпечка — новость на час. Если телефон офлайн дольше,
      // доставлять её уже бессмысленно, пусть Apple выбросит.
      'apns-expiration': String(Math.floor(Date.now() / 1000) + 3600),
      'content-type': 'application/json',
    })

    let status = 0
    let raw = ''

    req.on('response', headers => { status = Number(headers[':status']) || 0 })
    req.on('data', chunk => { raw += chunk })
    req.on('error', err => resolve({ token, ok: false, reason: err.message }))
    req.on('end', () => {
      if (status === 200) return resolve({ token, ok: true })
      let reason = `http_${status}`
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.reason) reason = parsed.reason
      } catch {
        // Тело не JSON — оставляем http_<код>.
      }
      resolve({ token, ok: false, reason })
    })

    req.setTimeout(10_000, () => {
      req.close()
      resolve({ token, ok: false, reason: 'timeout' })
    })

    req.end(payload)
  })
}

// Токены, которые Apple считает мёртвыми навсегда: приложение удалено или
// токен не от этого окружения. Их надо вычищать, иначе база пухнет мусором.
export function isDeadToken(reason?: string): boolean {
  return reason === 'Unregistered' || reason === 'BadDeviceToken' || reason === 'DeviceTokenNotForTopic'
}
