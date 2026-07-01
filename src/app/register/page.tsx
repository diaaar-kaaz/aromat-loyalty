'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LEVELS } from '@/lib/supabase'

type Step = 'form' | 'success'

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

    if (res.status === 409) {
      setError('Этот номер уже зарегистрирован')
      return
    }
    if (!res.ok) {
      setError('Ошибка. Попробуйте снова.')
      return
    }
    setStep('success')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-aromat text-white px-4 py-4">
        <h1 className="text-xl font-bold tracking-wide">AROMAT</h1>
        <p className="text-xs opacity-80">Бонусная программа</p>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        {step === 'form' && (
          <div className="mt-6 space-y-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#2C1810]">Тәттілік Club</p>
              <p className="text-sm text-gray-500 mt-1">Зарегистрируйся и копи бонусы с каждой покупки</p>
            </div>

            {/* Level preview */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(LEVELS).map(([key, lv]) => (
                <div key={key} className="bg-white rounded-xl p-3 flex items-center gap-2 shadow-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lv.color }} />
                  <div>
                    <p className="text-xs font-bold">{lv.label}</p>
                    <p className="text-xs text-gray-400">+{lv.percent}% бонусов</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Ваше имя</label>
                <input
                  type="text"
                  placeholder="Алима"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-aromat"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Номер телефона</label>
                <input
                  type="tel"
                  placeholder="+7 777 123 45 67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:border-aromat"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading || !name || !phone}
                className="w-full bg-aromat text-white rounded-xl py-3 font-semibold disabled:opacity-50"
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="mt-10 text-center space-y-5">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-[#2C1810]">Добро пожаловать!</h2>
            <p className="text-gray-500">Привет, <strong>{name}</strong>! Ты в Тәттілік Club.</p>
            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
              <p className="text-sm text-gray-500">Твой уровень</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#8B7355]" />
                <span className="text-xl font-bold">Нан</span>
              </div>
              <p className="text-sm text-aromat font-medium">+3% бонусов с каждой покупки</p>
            </div>
            <p className="text-xs text-gray-400">Называй номер телефона на кассе, чтобы начислять баллы</p>
            <Link
              href={`/client/${phone.replace(/\D/g, '')}`}
              className="block w-full bg-aromat text-white rounded-xl py-3 font-semibold"
            >
              Мой кабинет →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
