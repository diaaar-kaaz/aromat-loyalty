'use client'

import { useEffect, useState } from 'react'
import { Customer, BonusTransaction, LEVELS, getNextLevelThreshold, formatPhone } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import BottomNav from '@/components/BottomNav'

const levelIcons: Record<string, string> = { nan: '🍞', kumis: '🥐', altyn: '⭐', vip: '👑' }
const levelOrder = ['nan', 'kumis', 'altyn', 'vip']

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
      localStorage.setItem('my_phone', params.phone)
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
    <div className="min-h-screen bg-[#FDF8F4] flex flex-col items-center justify-center gap-4 p-6 pb-24">
      <span className="text-5xl">😕</span>
      <p className="text-xl font-bold text-[#2C1810]">Клиент не найден</p>
      <Link href="/register" className="py-3 px-8 rounded-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #C46245, #E8956D)' }}>
        Зарегистрироваться
      </Link>
      <BottomNav />
    </div>
  )

  if (!customer) return null

  const level = LEVELS[customer.level]
  const nextThreshold = getNextLevelThreshold(customer.level)
  const progress = nextThreshold ? Math.min((customer.total_spent / nextThreshold) * 100, 100) : 100
  const nextLevelKey = levelOrder[levelOrder.indexOf(customer.level) + 1]
  const nextLevel = nextLevelKey ? LEVELS[nextLevelKey as keyof typeof LEVELS] : null
  const remaining = nextThreshold ? nextThreshold - customer.total_spent : 0
  const currentLevelIdx = levelOrder.indexOf(customer.level)

  const tips: { icon: string; title: string; text: string; color: string }[] = []

  if (customer.bonus_balance >= 50) {
    tips.push({
      icon: '💰',
      title: 'Твои баллы работают',
      text: `${customer.bonus_balance} баллов = скидка до ${customer.bonus_balance} тг при следующей покупке.`,
      color: '#22c55e',
    })
  }
  if (remaining > 0 && remaining <= 10000 && nextLevel) {
    tips.push({
      icon: '🚀',
      title: 'Почти следующий уровень!',
      text: `Ещё ${remaining.toLocaleString()} тг покупок — и ты ${nextLevel.label}!`,
      color: '#C46245',
    })
  }
  tips.push({
    icon: '📱',
    title: 'Называй номер на кассе',
    text: 'Покажи QR‑код или назови номер — баллы начислятся автоматически.',
    color: '#8B7355',
  })
  tips.push({
    icon: '⭐',
    title: `+${level.percent}% с каждой покупки`,
    text: `Уровень ${level.label}: с каждых 1 000 тг — ${Math.round(1000 * level.percent / 100)} баллов.`,
    color: level.color,
  })

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex flex-col pb-24">
      {/* Hero card */}
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

      <main className="flex-1 px-4 -mt-12 space-y-3 max-w-md mx-auto w-full">

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#2C1810] mb-4 text-center">Покажи на кассе</p>
          <div className="flex justify-center p-4 bg-[#FDF8F4] rounded-2xl">
            <QRCode value={customer.phone} size={140} fgColor="#C46245" bgColor="#FDF8F4" />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">{formatPhone(customer.phone)}</p>
        </div>

        {/* Советы */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="font-bold text-[#2C1810] mb-3">Советы</p>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl" style={{ background: `${tip.color}12` }}>
                <span className="text-2xl shrink-0">{tip.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#2C1810]">{tip.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress to next level */}
        {nextThreshold && nextLevel && (
          <div className="bg-white rounded-3xl p-4 shadow-sm">
            <p className="font-bold text-[#2C1810] mb-3">До следующего уровня</p>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span>{levelIcons[customer.level]}</span>
                <span className="text-sm font-semibold text-[#2C1810]">{level.label}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-sm">→</span>
                <span>{levelIcons[nextLevelKey]}</span>
                <span className="text-sm font-medium text-[#2C1810]">{nextLevel.label}</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-400">{customer.total_spent.toLocaleString()} тг</p>
              <p className="text-xs font-semibold" style={{ color: nextLevel.color }}>
                осталось {remaining.toLocaleString()} тг
              </p>
            </div>
          </div>
        )}

        {/* All levels */}
        <div className="bg-white rounded-3xl p-4 shadow-sm">
          <p className="font-bold text-[#2C1810] mb-3">Уровни клуба</p>
          <div className="space-y-2">
            {Object.entries(LEVELS).map(([key, lv], i) => {
              const isActive = key === customer.level
              const isAchieved = i <= currentLevelIdx
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{
                    background: isActive ? `${lv.color}20` : isAchieved ? `${lv.color}10` : '#f5f5f5',
                    border: isActive ? `2px solid ${lv.color}` : '2px solid transparent',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: isActive ? lv.color : isAchieved ? `${lv.color}40` : '#e0e0e0' }}
                  >
                    {levelIcons[key]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#2C1810]">{lv.label}</p>
                      {isActive && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold shrink-0"
                          style={{ background: lv.color }}
                        >
                          Ваш уровень
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {lv.threshold === 0 ? 'Стартовый · ' : `от ${lv.threshold.toLocaleString()} тг · `}+{lv.percent}% бонусов
                    </p>
                  </div>
                  {isAchieved && !isActive && <span className="text-green-500 text-base shrink-0">✓</span>}
                  {!isAchieved && <span className="text-gray-300 text-base shrink-0">○</span>}
                </div>
              )
            })}
          </div>
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

        <p className="text-center text-xs text-gray-400 pt-2 pb-2">Рахмет! Үй сияқты — Как дома 🍞</p>
      </main>

      <BottomNav />
    </div>
  )
}
