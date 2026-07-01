'use client'

import { useEffect, useState } from 'react'
import { Customer, BonusTransaction, LEVELS, getNextLevelThreshold, formatPhone } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'react-qr-code'

const levelIcons: Record<string, string> = { nan: '🍞', kumis: '🥐', altyn: '⭐', vip: '👑' }

export default function ClientPage({ params }: { params: { phone: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [transactions, setTransactions] = useState<BonusTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/customers?phone=${params.phone}`)
      if (!res.ok) { setNotFound(true); setLoading(false); return }
      const data: Customer = await res.json()
      setCustomer(data)
      const { data: txs } = await supabase
        .from('bonus_transactions')
        .select('*')
        .eq('customer_id', data.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setTransactions(txs || [])
      setLoading(false)
    }
    load()
  }, [params.phone])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #2C1810, #C46245)' }}>
      <div className="text-white/50 text-sm">Загрузка...</div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 p-6">
      <span className="text-5xl">😕</span>
      <p className="text-xl font-bold text-[#2C1810]">Клиент не найден</p>
      <Link href="/register" className="py-3 px-8 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}>
        Зарегистрироваться
      </Link>
    </div>
  )

  if (!customer) return null

  const level = LEVELS[customer.level]
  const nextThreshold = getNextLevelThreshold(customer.level)
  const progress = nextThreshold ? Math.min((customer.total_spent / nextThreshold) * 100, 100) : 100
  const nextLevel = customer.level === 'nan' ? LEVELS.kumis : customer.level === 'kumis' ? LEVELS.altyn : customer.level === 'altyn' ? LEVELS.vip : null

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Hero / Loyalty Card */}
      <div className="relative overflow-hidden px-4 pt-10 pb-24" style={{ background: `linear-gradient(135deg, #2C1810, ${level.color})` }}>
        <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute -left-8 bottom-0 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-widest">AROMAT</p>
              <p className="text-white/30 text-xs">Тәттілік Club</p>
            </div>
            <div className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1.5">
              <span className="text-base">{levelIcons[customer.level]}</span>
              <span className="text-white text-xs font-bold">{level.label}</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-white/50 text-xs mb-1">Баланс баллов</p>
            <p className="text-5xl font-extrabold text-white">{customer.bonus_balance}</p>
          </div>

          <div>
            <p className="text-white font-bold text-lg">{customer.name}</p>
            <p className="text-white/50 text-sm">{formatPhone(customer.phone)}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 -mt-12 space-y-3 pb-8 max-w-md mx-auto w-full">
        {/* Level progress */}
        {nextThreshold && nextLevel && (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span>{levelIcons[customer.level]}</span>
                <span className="text-sm font-semibold text-[#2C1810]">{level.label}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-sm">→</span>
                <span>{levelIcons[Object.keys(LEVELS).find(k => LEVELS[k as keyof typeof LEVELS] === nextLevel) || 'kumis']}</span>
                <span className="text-sm font-medium">{nextLevel.label}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {customer.total_spent.toLocaleString()} / {nextThreshold.toLocaleString()} тг
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2C1810] mb-4 text-center">Покажи на кассе</p>
          <div className="flex justify-center p-4 bg-cream rounded-2xl">
            <QRCode value={customer.phone} size={140} fgColor="#C46245" bgColor="#FDF8F4" />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">{formatPhone(customer.phone)}</p>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="font-bold text-[#2C1810] mb-3">История операций</p>
            <div className="space-y-0.5">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${tx.type === 'earn' ? 'bg-green-50' : 'bg-red-50'}`}>
                      {tx.type === 'earn' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2C1810]">{tx.note || (tx.type === 'earn' ? 'Начисление' : 'Списание')}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'earn' ? 'text-green-500' : 'text-red-400'}`}>
                    {tx.type === 'earn' ? '+' : '−'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pt-2">Рахмет! Үй сияқты — Как дома 🍞</p>
      </main>
    </div>
  )
}
