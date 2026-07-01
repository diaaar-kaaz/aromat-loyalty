import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #2C1810 0%, #C46245 60%, #E8956D 100%)' }}>
      {/* Top decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: '#FDF8F4' }} />
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full opacity-5" style={{ background: '#FDF8F4' }} />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur mb-6 text-4xl">
            🍞
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">AROMAT</h1>
          <p className="text-white/70 text-base font-medium">Тәттілік Club</p>
          <p className="text-white/50 text-sm mt-1">Бонусная программа лояльности</p>
        </div>

        {/* Cards */}
        <div className="w-full max-w-xs space-y-3">
          <Link href="/cashier" className="flex items-center gap-4 w-full bg-white rounded-2xl px-5 py-4 shadow-lg group hover:scale-[1.02] transition-transform">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FDF8F4' }}>
              🧾
            </div>
            <div className="text-left">
              <p className="font-bold text-[#2C1810]">Панель кассира</p>
              <p className="text-xs text-gray-400">Найти клиента, начислить баллы</p>
            </div>
            <span className="ml-auto text-gray-300 group-hover:text-aromat transition-colors">→</span>
          </Link>

          <Link href="/register" className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 border border-white/30 backdrop-blur bg-white/10 group hover:bg-white/20 transition-all">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              ✨
            </div>
            <div className="text-left">
              <p className="font-bold text-white">Регистрация клиента</p>
              <p className="text-xs text-white/60">Вступить в Тәттілік Club</p>
            </div>
            <span className="ml-auto text-white/40 group-hover:text-white transition-colors">→</span>
          </Link>
        </div>

        <Link href="/admin" className="mt-8 text-white/40 text-xs hover:text-white/70 transition-colors">
          Вход для администратора
        </Link>
      </div>

      {/* Bottom tagline */}
      <div className="text-center pb-8 relative z-10">
        <p className="text-white/30 text-xs">Үй сияқты — Как дома 🍞</p>
      </div>
    </div>
  )
}
