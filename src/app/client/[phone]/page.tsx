'use client'

import { useEffect, useState } from 'react'
import { Customer, BonusTransaction, LEVELS, getNextLevelThreshold, formatPhone } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'react-qr-code'

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
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <p className="text-gray-400">Загрузка...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-xl font-bold">Клиент не найден</p>
      <Link href="/register" className="bg-aromat text-white px-6 py-3 rounded-xl font-semibold">
        Зарегистрироваться
      </Link>
    </div>
  )

  if (!customer) return null

  const level = LEVELS[customer.level]
  const nextThreshold = getNextLevelThreshold(customer.level)
  const progress = nextThreshold
    ? Math.min((customer.total_spent / nextThreshold) * 100, 100)
    : 100

  const nextLevel = customer.level === 'nan' ? LEVELS.kumis
    : customer.level === 'kumis' ? LEVELS.altyn
    : customer.level === 'altyn' ? LEVELS.vip
    : null

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="bg-aromat text-white px-4 py-4">
        <h1 className="text-xl font-bold">AROMAT</h1>
        <p className="text-xs opacity-80">Тәттілік Club</p>
      </header>

      <main className="flex-1 p-4 max-w-md mx-auto w-full space-y-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center text-2xl font-bold text-aromat">
              {customer.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{customer.name}</p>
              <p className="text-sm text-gray-400">{formatPhone(customer.phone)}</p>
            </div>
            <div
              className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: level.color }}
            >
              {level.label}
            </div>
          </div>

          {/* Balance */}
          <div className="bg-cream rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">Бонусный баланс</p>
            <p className="text-4xl font-bold text-aromat">{customer.bonus_balance}</p>
            <p className="text-xs text-gray-400 mt-1">баллов</p>
          </div>
        </div>

        {/* Level progress */}
        {nextThreshold && nextLevel && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{level.label}</span>
              <span className="text-gray-400">{nextLevel.label}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: level.color }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {customer.total_spent.toLocaleString()} / {nextThreshold.toLocaleString()} тг до уровня {nextLevel.label}
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-600 mb-3">Покажи на кассе</p>
          <div className="flex justify-center">
            <QRCode value={customer.phone} size={140} fgColor="#C46245" />
          </div>
          <p className="text-xs text-gray-400 mt-3">{formatPhone(customer.phone)}</p>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="font-semibold mb-3">История операций</p>
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tx.note || (tx.type === 'earn' ? 'Начисление' : 'Списание')}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'earn' ? '+' : '−'}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Рахмет! Үй сияқты — Как дома 🍞
        </p>
      </main>
    </div>
  )
}
