'use client'

import { useState } from 'react'
import { Customer, LEVELS, calcEarnedBonus, formatPhone } from '@/lib/supabase'
import Link from 'next/link'

type Step = 'search' | 'found' | 'confirm' | 'done'

export default function CashierPage() {
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orderAmount, setOrderAmount] = useState('')
  const [spendBonus, setSpendBonus] = useState(false)
  const [step, setStep] = useState<Step>('search')
  const [result, setResult] = useState<{ earned: number; spent: number; new_balance: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = parseInt(orderAmount) || 0
  const level = customer ? LEVELS[customer.level] : null
  const earnedPreview = customer ? calcEarnedBonus(amount, customer.level) : 0
  const maxSpend = customer ? Math.min(customer.bonus_balance, Math.floor(amount * 0.2)) : 0

  async function handleSearch() {
    if (!phone) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/customers?phone=${phone.replace(/\D/g, '')}`)
    setLoading(false)
    if (res.status === 404) {
      setError('not_found')
      return
    }
    const data = await res.json()
    setCustomer(data)
    setStep('found')
  }

  async function handleConfirm() {
    if (!customer || !amount) return
    setLoading(true)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customer.id,
        order_amount: amount,
        spend_bonus: spendBonus ? maxSpend : 0,
      }),
    })
    setLoading(false)
    if (!res.ok) return
    const data = await res.json()
    setResult(data)
    setStep('done')
  }

  function reset() {
    setPhone('')
    setCustomer(null)
    setOrderAmount('')
    setSpendBonus(false)
    setStep('search')
    setResult(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="bg-aromat text-white px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-wide">AROMAT</h1>
          <p className="text-xs opacity-80">Панель кассира</p>
        </div>
        <Link href="/admin" className="text-xs opacity-70 hover:opacity-100 border border-white/40 px-2 py-1 rounded">
          Админ
        </Link>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">

        {/* STEP: SEARCH */}
        {step === 'search' && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-center text-[#2C1810]">
              Найти клиента
            </h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <label className="text-sm font-medium text-gray-600">Номер телефона</label>
              <input
                type="tel"
                placeholder="+7 777 123 45 67"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-aromat"
              />
              {error === 'not_found' && (
                <div className="bg-red-50 rounded-xl p-3 text-sm text-red-600">
                  Клиент не найден.{' '}
                  <Link href="/register" className="font-semibold underline">Зарегистрировать?</Link>
                </div>
              )}
              <button
                onClick={handleSearch}
                disabled={loading || !phone}
                className="w-full bg-aromat text-white rounded-xl py-3 font-semibold text-base disabled:opacity-50"
              >
                {loading ? 'Поиск...' : 'Найти'}
              </button>
            </div>
            <div className="text-center">
              <Link href="/register" className="text-sm text-aromat font-medium">
                + Зарегистрировать нового клиента
              </Link>
            </div>
          </div>
        )}

        {/* STEP: FOUND */}
        {step === 'found' && customer && level && (
          <div className="mt-6 space-y-4">
            {/* Customer card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center text-xl font-bold text-aromat">
                  {customer.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg">{customer.name}</p>
                  <p className="text-sm text-gray-500">{formatPhone(customer.phone)}</p>
                </div>
                <div
                  className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: level.color }}
                >
                  {level.label}
                </div>
              </div>
              <div className="bg-cream rounded-xl p-3 flex justify-between items-center">
                <span className="text-sm text-gray-600">Баланс баллов</span>
                <span className="text-2xl font-bold text-aromat">{customer.bonus_balance}</span>
              </div>
            </div>

            {/* Order amount */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <label className="text-sm font-medium text-gray-600">Сумма чека (тг)</label>
              <input
                type="number"
                placeholder="0"
                value={orderAmount}
                onChange={e => setOrderAmount(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:border-aromat"
              />

              {amount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Начислится баллов (+{level.percent}%)</span>
                    <span className="font-semibold text-green-600">+{earnedPreview} бонусов</span>
                  </div>

                  {customer.bonus_balance > 0 && (
                    <label className="flex items-center gap-3 bg-cream rounded-xl p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spendBonus}
                        onChange={e => setSpendBonus(e.target.checked)}
                        className="w-5 h-5 accent-aromat"
                      />
                      <div>
                        <p className="text-sm font-medium">Списать баллы (до 20% чека)</p>
                        <p className="text-xs text-gray-500">Скидка {maxSpend} тг</p>
                      </div>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 border border-gray-200 rounded-xl py-3 font-medium text-gray-600">
                Назад
              </button>
              <button
                onClick={handleConfirm}
                disabled={!amount || loading}
                className="flex-2 bg-aromat text-white rounded-xl py-3 px-6 font-semibold disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: DONE */}
        {step === 'done' && result && (
          <div className="mt-6 space-y-4 text-center">
            <div className="text-5xl">✓</div>
            <h2 className="text-xl font-bold text-[#2C1810]">Готово! Рахмет!</h2>

            <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3 text-left">
              {result.spent > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Списано баллов</span>
                  <span className="font-bold text-red-500">−{result.spent}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Начислено баллов</span>
                <span className="font-bold text-green-600">+{result.earned}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">Новый баланс</span>
                <span className="text-xl font-bold text-aromat">{result.new_balance}</span>
              </div>
            </div>

            <button onClick={reset} className="w-full bg-aromat text-white rounded-xl py-3 font-semibold text-base">
              Новый чек
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
