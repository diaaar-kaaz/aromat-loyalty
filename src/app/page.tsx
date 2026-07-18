'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { LEVELS } from '@/lib/supabase'
import { saveMyPhone } from '@/lib/session'

const levelIcons: Record<string, string> = { nan: '🍞', kumis: '🥐', altyn: '⭐', vip: '👑' }

const levels = Object.entries(LEVELS).map(([key, lv]) => ({
  icon: levelIcons[key],
  label: lv.label,
  pct: lv.percent,
  threshold: lv.threshold === 0 ? 'Стартовый' : `от ${lv.threshold.toLocaleString('ru-RU')} тг`,
  color: lv.color,
}))

export default function Home() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!phone) return
    setLoading(true)
    setError('')
    const clean = phone.replace(/\D/g, '')
    const res = await fetch(`/api/customers?phone=${clean}`)
    setLoading(false)
    if (res.status === 404) { setError('not_found'); return }
    if (!res.ok) { setError('error'); return }
    saveMyPhone(clean)
    router.push(`/client/${clean}`)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex flex-col pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden px-4 pt-14 pb-12 text-center" style={{ background: 'linear-gradient(160deg, #2C1810, #C46245)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4 text-3xl">
          🍞
        </div>
        <h1 className="text-3xl font-extrabold text-white">AROMAT</h1>
        <p className="text-white/60 text-sm mt-1">Тәттілік Club · Бонусная программа</p>
      </div>

      <main className="flex-1 px-4 -mt-5 max-w-sm mx-auto w-full space-y-4 pb-4">
        {/* Phone search */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="font-bold text-[#2C1810] text-lg mb-1">Ваша бонусная карта</p>
          <p className="text-sm text-gray-400 mb-4">Введите номер телефона для входа</p>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📱</span>
              <input
                type="tel"
                placeholder="+7 777 123 45 67"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#C46245] text-base"
              />
            </div>

            {error === 'not_found' && (
              <div className="bg-orange-50 rounded-2xl p-3 text-sm text-center">
                <p className="text-orange-700 font-medium">Номер не найден в системе</p>
                <p className="text-orange-500 text-xs mt-0.5">Зарегистрируйтесь и начните копить баллы</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
            >
              {loading ? 'Поиск...' : 'Найти карту →'}
            </button>
          </form>
        </div>

        {/* Register */}
        <Link href="/register" className="flex items-center gap-4 bg-white rounded-3xl p-5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF8F4] flex items-center justify-center text-2xl shrink-0">✨</div>
          <div className="flex-1">
            <p className="font-bold text-[#2C1810]">Ещё не в клубе?</p>
            <p className="text-sm text-gray-400">Регистрация бесплатная</p>
          </div>
          <span className="text-gray-300">→</span>
        </Link>

        {/* Levels preview */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Уровни клуба</p>
          <div className="space-y-2">
            {levels.map(lv => (
              <div key={lv.label} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: `${lv.color}12` }}>
                <span className="text-xl w-8 text-center shrink-0">{lv.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: lv.color }}>{lv.label}</p>
                  <p className="text-xs text-gray-400">{lv.threshold}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: lv.color }}>+{lv.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <Link href="/admin" className="block text-center text-xs text-gray-300 py-2">
          Вход для администратора →
        </Link>
      </main>

      <BottomNav />
    </div>
  )
}
