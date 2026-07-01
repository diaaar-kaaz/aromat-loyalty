'use client'

import { useState, useEffect } from 'react'
import { Customer, LEVELS, calcEarnedBonus, formatPhone } from '@/lib/supabase'
import Link from 'next/link'

type Step = 'search' | 'found' | 'done'

function PinScreen({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/cashier/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    })
    setLoading(false)
    if (!res.ok) { setError('Неверный PIN'); setPin(''); return }
    sessionStorage.setItem('cashier_authed', '1')
    onAuth()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(160deg, #2C1810, #C46245)' }}>
      <div className="text-4xl mb-4">🔒</div>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-xs space-y-4">
        <div>
          <p className="text-xl font-extrabold text-[#2C1810]">Касса</p>
          <p className="text-sm text-gray-400">Введите PIN-код сотрудника</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          value={pin}
          onChange={e => { setPin(e.target.value); setError('') }}
          maxLength={8}
          autoFocus
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-[#C46245]"
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading || !pin}
          className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
        >
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

export default function CashierPage() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('cashier_authed') === '1') setAuthed(true)
    setCheckingAuth(false)
  }, [])

  if (checkingAuth) return null
  if (!authed) return <PinScreen onAuth={() => setAuthed(true)} />

  return <CashierPanel />
}

function CashierPanel() {
  const [phone, setPhone] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [orderAmount, setOrderAmount] = useState('')
  const [spendBonus, setSpendBonus] = useState(false)
  const [step, setStep] = useState<Step>('search')
  const [result, setResult] = useState<{ earned: number; spent: number; new_balance: number; new_level: string } | null>(null)
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
    if (res.status === 404) { setError('not_found'); return }
    setCustomer(await res.json())
    setStep('found')
  }

  async function handleConfirm() {
    if (!customer || !amount) return
    setLoading(true)
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customer.id, order_amount: amount, spend_bonus: spendBonus ? maxSpend : 0 }),
    })
    setLoading(false)
    if (!res.ok) return
    setResult(await res.json())
    setStep('done')
  }

  function reset() {
    setPhone(''); setCustomer(null); setOrderAmount('')
    setSpendBonus(false); setStep('search'); setResult(null); setError('')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <header className="px-4 pt-safe py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #2C1810, #C46245)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-lg">🍞</div>
          <div>
            <p className="text-white font-bold text-base leading-none">AROMAT</p>
            <p className="text-white/60 text-xs">Касса</p>
          </div>
        </div>
        <Link href="/admin" className="text-white/50 text-xs border border-white/20 px-3 py-1.5 rounded-lg hover:text-white/80">
          Админ
        </Link>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full">

        {/* SEARCH */}
        {step === 'search' && (
          <div className="mt-6 space-y-4">
            <h2 className="text-xl font-bold text-[#2C1810]">Найти клиента</h2>

            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-lg">📱</span>
                <input
                  type="tel"
                  placeholder="+7 777 123 45 67"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-11 pr-4 py-3.5 border border-gray-100 rounded-2xl text-base focus:outline-none focus:border-aromat bg-gray-50"
                />
              </div>

              {error === 'not_found' && (
                <div className="flex items-center gap-3 bg-red-50 rounded-2xl p-3.5">
                  <span>😕</span>
                  <div className="text-sm">
                    <p className="text-red-600 font-medium">Клиент не найден</p>
                    <Link href="/register" className="text-aromat underline text-xs">Зарегистрировать?</Link>
                  </div>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={loading || !phone}
                className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
              >
                {loading ? 'Поиск...' : 'Найти клиента'}
              </button>
            </div>

            <Link href="/register" className="flex items-center justify-center gap-2 text-aromat text-sm font-semibold py-3">
              <span className="text-lg">+</span> Новый клиент
            </Link>
          </div>
        )}

        {/* FOUND */}
        {step === 'found' && customer && level && (
          <div className="mt-4 space-y-3">
            {/* Customer card */}
            <div className="rounded-3xl p-5 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${level.color}dd, ${level.color})` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/25 flex items-center justify-center text-xl font-bold">
                    {customer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{customer.name}</p>
                    <p className="text-white/70 text-xs">{formatPhone(customer.phone)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Уровень</p>
                  <p className="font-bold text-sm">{level.label}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-2xl p-4 text-center">
                <p className="text-white/70 text-xs mb-1">Баланс баллов</p>
                <p className="text-4xl font-extrabold">{customer.bonus_balance}</p>
              </div>
            </div>

            {/* Amount input */}
            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <p className="font-bold text-[#2C1810]">Сумма чека</p>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={orderAmount}
                  onChange={e => setOrderAmount(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 text-3xl font-extrabold border border-gray-100 rounded-2xl focus:outline-none focus:border-aromat bg-gray-50 text-[#2C1810]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">тг</span>
              </div>

              {amount > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-sm text-gray-500">Начислится (+{level.percent}%)</span>
                    <span className="font-bold text-green-600 text-base">+{earnedPreview} ₿</span>
                  </div>

                  {customer.bonus_balance > 0 && (
                    <label className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={spendBonus}
                        onChange={e => setSpendBonus(e.target.checked)}
                        className="w-5 h-5 rounded accent-aromat"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2C1810]">Списать баллы</p>
                        <p className="text-xs text-gray-500">Скидка {maxSpend} тг (до 20% чека)</p>
                      </div>
                      <span className="text-aromat font-bold text-sm">−{maxSpend}</span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="w-14 h-14 rounded-2xl border border-gray-200 text-gray-400 text-xl flex items-center justify-center hover:bg-gray-50">
                ←
              </button>
              <button
                onClick={handleConfirm}
                disabled={!amount || loading}
                className="flex-1 py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
              >
                {loading ? 'Сохранение...' : `Подтвердить • ${amount ? amount.toLocaleString() : 0} тг`}
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === 'done' && result && (
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mx-auto mb-4">✓</div>
              <h2 className="text-2xl font-extrabold text-[#2C1810]">Готово!</h2>
              <p className="text-gray-400 text-sm mt-1">Рахмет!</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
              {result.spent > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Списано баллов</span>
                  <span className="font-bold text-red-400 text-lg">−{result.spent}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">Начислено баллов</span>
                <span className="font-bold text-green-500 text-lg">+{result.earned}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-[#2C1810]">Новый баланс</span>
                <span className="text-3xl font-extrabold text-aromat">{result.new_balance}</span>
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full py-4 rounded-2xl font-bold text-white text-base"
              style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}
            >
              Новый чек
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
