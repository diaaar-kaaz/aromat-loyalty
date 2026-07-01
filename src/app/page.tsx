import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-aromat mb-2">AROMAT</h1>
      <p className="text-gray-500 mb-10 text-center">Тәттілік Club — Бонусная программа</p>
      <div className="w-full max-w-xs space-y-3">
        <Link href="/cashier" className="block w-full bg-aromat text-white text-center rounded-xl py-4 font-semibold text-lg">
          Панель кассира
        </Link>
        <Link href="/register" className="block w-full bg-white border border-aromat text-aromat text-center rounded-xl py-4 font-semibold text-lg">
          Регистрация клиента
        </Link>
        <Link href="/admin" className="block w-full text-center text-sm text-gray-400 py-2">
          Аналитика (Admin)
        </Link>
      </div>
    </div>
  )
}
