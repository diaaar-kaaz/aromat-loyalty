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

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/stats', {
      headers: { 'x-admin-password': password },
    })
    setLoading(false)
    if (res.status === 401) { setError('Неверный пароль'); return }
    setStats(await res.json())
    setAuthed(true)
  }

  if (!authed) return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Aromat Admin</h1>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-aromat"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-aromat text-white rounded-xl py-3 font-semibold"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  )

  if (!stats) return null

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-aromat text-white px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">AROMAT</h1>
          <p className="text-xs opacity-80">Аналитика</p>
        </div>
        <Link href="/cashier" className="text-xs opacity-70 hover:opacity-100 border border-white/40 px-2 py-1 rounded">
          Касса
        </Link>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Клиентов</p>
            <p className="text-3xl font-bold text-aromat">{stats.total_customers}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-gray-500">Баллов выдано</p>
            <p className="text-3xl font-bold text-green-600">{stats.total_earned_bonus.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm col-span-2">
            <p className="text-sm text-gray-500">Баллов списано (скидки)</p>
            <p className="text-3xl font-bold text-red-400">{stats.total_spent_bonus.toLocaleString()}</p>
          </div>
        </div>

        {/* By level */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-semibold mb-3">По уровням</p>
          <div className="space-y-2">
            {Object.entries(LEVELS).map(([key, lv]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lv.color }} />
                <span className="text-sm flex-1">{lv.label}</span>
                <span className="font-bold">{stats.by_level[key as keyof typeof stats.by_level]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top customers */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="font-semibold mb-3">Топ клиентов</p>
          <div className="space-y-2">
            {stats.top_customers.map((c, i) => (
              <div key={c.phone} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-400 text-sm w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{c.total_spent.toLocaleString()} тг</p>
                  <p className="text-xs text-aromat">{c.bonus_balance} бонусов</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
