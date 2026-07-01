'use client'

import { useState } from 'react'
import { LEVELS } from '@/lib/supabase'
import Link from 'next/link'

type Stats = {
  total_customers: number
  total_earned_bonus: number
  total_spent_bonus: number
  by_level: { nan: number; kumis: number; altyn: number; vip: number }
  top_customers: Array<{ name: string; phone: string; total_spent: number; bonus_balance: number; level: string }>
}

const levelIcons: Record<string, string> = { nan: '🍞', kumis: '🥐', altyn: '⭐', vip: '👑' }

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/stats', { headers: { 'x-admin-password': password } })
    setLoading(false)
    if (res.status === 401) { setError('Неверный пароль'); return }
    setStats(await res.json())
    setAuthed(true)
  }

  if (!authed) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #2C1810, #C46245)' }}>
      <div className="text-4xl mb-4">🔐</div>
      <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm space-y-4">
        <div>
          <p className="text-xl font-extrabold text-[#2C1810]">Aromat Admin</p>
          <p className="text-sm text-gray-400">Аналитика и статистика</p>
        </div>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:outline-none focus:border-aromat"
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )

  if (!stats) return null

  return (
    <div className="min-h-screen bg-cream">
      <div className="relative overflow-hidden px-4 pt-10 pb-8" style={{ background: 'linear-gradient(135deg, #2C1810, #C46245)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest">AROMAT</p>
            <p className="text-white text-2xl font-extrabold">Аналитика</p>
          </div>
          <Link href="/cashier" className="bg-white/15 text-white text-xs px-3 py-2 rounded-xl">
            Касса →
          </Link>
        </div>
      </div>

      <main className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Всего клиентов</p>
            <p className="text-3xl font-extrabold text-[#2C1810]">{stats.total_customers}</p>
            <p className="text-xs text-gray-300 mt-1">в программе</p>
          </div>
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Выдано баллов</p>
            <p className="text-3xl font-extrabold text-green-500">{stats.total_earned_bonus.toLocaleString()}</p>
            <p className="text-xs text-gray-300 mt-1">за всё время</p>
          </div>
          <div className="col-span-2 bg-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">Потрачено баллов (скидки)</p>
              <p className="text-3xl font-extrabold text-aromat">{stats.total_spent_bonus.toLocaleString()}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl">🎁</div>
          </div>
        </div>

        {/* By level */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="font-bold text-[#2C1810] mb-4">Распределение по уровням</p>
          <div className="space-y-3">
            {Object.entries(LEVELS).map(([key, lv]) => {
              const count = stats.by_level[key as keyof typeof stats.by_level]
              const pct = stats.total_customers > 0 ? Math.round((count / stats.total_customers) * 100) : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{levelIcons[key]}</span>
                      <span className="text-sm font-medium text-[#2C1810]">{lv.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[#2C1810]">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: lv.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top customers */}
        {stats.top_customers.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="font-bold text-[#2C1810] mb-4">Топ клиентов</p>
            <div className="space-y-0.5">
              {stats.top_customers.map((c, i) => (
                <div key={c.phone} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400">{i + 1}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-aromat text-sm">
                    {c.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#2C1810] truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#2C1810]">{c.total_spent.toLocaleString()} тг</p>
                    <p className="text-xs text-aromat">{c.bonus_balance} бонусов</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
