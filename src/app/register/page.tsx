'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LEVELS } from '@/lib/supabase'
import BottomNav from '@/components/BottomNav'

type Step = 'form' | 'success'

const levelIcons: Record<string, string> = {
  nan: '🍞',
  kumis: '🥐',
  altyn: '⭐',
  vip: '👑',
}

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<Step>('form')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), phone }),
    })
    setLoading(false)
    if (res.status === 409) { setError('Этот номер уже зарегистрирован'); return }
    if (!res.ok) { setError('Ошибка. Попробуйте снова.'); return }
    localStorage.setItem('my_phone', phone.replace(/\D/g, ''))
    setStep('success')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col pb-24">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-8 text-white" style={{ background: 'linear-gradient(160deg, #2C1810, #C46245)' }}>
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <Link href="/" className="text-white/50 text-sm mb-6 block">← Назад</Link>
        <div className="text-4xl mb-3">✨</div>
        <h1 className="text-2xl font-extrabold">Тәттілік Club</h1>
        <p className="text-white/60 text-sm mt-1">Вступай — копи баллы с каждой покупки</p>
      </div>

      <main className="flex-1 p-4 max-w-md mx-auto w-full -mt-4">
        {step === 'form' && (
          <div className="space-y-4">
            {/* Level preview */}
            <div className="bg-white rounded-3xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Уровни программы</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(LEVELS).map(([key, lv]) => (
                  <div key={key} className="rounded-2xl p-3 flex items-center gap-2" style={{ background: `${lv.color}15` }}>
                    <span className="text-xl">{levelIcons[key]}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: lv.color }}>{lv.label}</p>
                      <p className="text-xs text-gray-400">+{lv.percent}% бонусов</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <p className="font-bold text-[#2C1810] text-lg">Регистрация</p>

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">👤</span>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-aromat text-base"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📱</span>
                  <input
                    type="tel"
                    placeholder="+7 777 123 45 67"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-aromat text-base"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 rounded-2xl p-3 text-sm text-red-500 text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !name || !phone}
                className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
              >
                {loading ? 'Регистрация...' : 'Вступить в клуб →'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="mt-6 space-y-5">
            {/* Success card */}
            <div className="rounded-3xl p-6 text-white text-center shadow-lg" style={{ background: 'linear-gradient(135deg, #8B7355, #C46245)' }}>
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-extrabold">Добро пожаловать!</h2>
              <p className="text-white/70 text-sm mt-1">{name}, ты в Тәттілік Club!</p>

              <div className="mt-5 bg-white/20 rounded-2xl p-4">
                <p className="text-white/60 text-xs mb-1">Твой стартовый уровень</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">🍞</span>
                  <span className="text-xl font-extrabold">Нан</span>
                </div>
                <p className="text-white/80 text-sm mt-1">+{LEVELS.nan.percent}% бонусов с каждой покупки</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm text-center space-y-2">
              <p className="text-sm text-gray-500">Называй номер телефона на кассе</p>
              <p className="font-bold text-[#2C1810] text-lg">{phone}</p>
              <p className="text-xs text-gray-400">чтобы получать и тратить баллы</p>
            </div>

            <Link
              href={`/client/${phone.replace(/\D/g, '')}`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
            >
              Мой кабинет →
            </Link>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
