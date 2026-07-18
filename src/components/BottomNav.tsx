'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getMyPhone, MY_PHONE_EVENT } from '@/lib/session'

export default function BottomNav() {
  const pathname = usePathname()
  const [myPhone, setMyPhone] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setMyPhone(getMyPhone())
    update()
    window.addEventListener(MY_PHONE_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(MY_PHONE_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [pathname])

  const tabs = [
    {
      href: '/',
      icon: '🏠',
      label: 'Главная',
      active: pathname === '/' || pathname === '/register',
    },
    {
      href: myPhone ? `/client/${myPhone}` : '/register',
      icon: '💳',
      label: 'Мой бонус',
      active: pathname.startsWith('/client'),
    },
    {
      href: '/cashier',
      icon: '🧾',
      label: 'Касса',
      active: pathname.startsWith('/cashier'),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 flex z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {tabs.map(tab => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
            tab.active ? 'text-[#C46245]' : 'text-gray-400'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] font-semibold">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
