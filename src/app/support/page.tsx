import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Поддержка — Aromat',
  description: 'Помощь и контакты для пользователей программы лояльности Aromat.',
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F4] px-5 py-12 text-[#2C1810]">
      <div className="mx-auto max-w-xl">
        <div className="text-5xl">🥐</div>
        <h1 className="mt-3 text-3xl font-extrabold text-[#C46245]">Поддержка Aromat</h1>
        <p className="mt-2 leading-relaxed text-gray-600">
          Программа лояльности Aromat — Тәттілік Club. Если у вас вопрос по баллам, уровню,
          штамп-карте или регистрации — свяжитесь с нами, мы поможем.
        </p>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Связаться с нами</h2>
          <ul className="mt-3 space-y-2">
            <li>📞 Телефон / WhatsApp: <a className="text-[#C46245] underline" href="tel:+77715297049">+7 771 529 70 49</a></li>
            <li>✉️ Email: <a className="text-[#C46245] underline" href="mailto:dkazzzbekov@gmail.com">dkazzzbekov@gmail.com</a></li>
            <li>📸 Instagram: <a className="text-[#C46245] underline" href="https://instagram.com/aromatbakery">@aromatbakery</a></li>
            <li>📍 Адрес: Тауелсыздык 23, Астана</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Частые вопросы</h2>
          <div className="mt-3 space-y-4 text-gray-700">
            <div>
              <p className="font-semibold text-[#2C1810]">Как копить баллы?</p>
              <p>Назовите свой номер телефона на кассе — баллы начислятся автоматически с каждой покупки.</p>
            </div>
            <div>
              <p className="font-semibold text-[#2C1810]">Как потратить баллы?</p>
              <p>Скажите кассиру, что хотите списать баллы — их можно использовать как скидку при оплате.</p>
            </div>
            <div>
              <p className="font-semibold text-[#2C1810]">Что за штамп-карта?</p>
              <p>Выберите категорию при регистрации (кофе, выпечка или десерт), собирайте штампы за покупки и получайте угощение в подарок.</p>
            </div>
            <div>
              <p className="font-semibold text-[#2C1810]">Как удалить аккаунт?</p>
              <p>Напишите нам по контактам выше — удалим ваш аккаунт и данные по запросу.</p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-sm text-gray-400">
          <a className="underline" href="/privacy">Политика конфиденциальности</a>
        </p>
        <p className="mt-2 text-center text-sm text-gray-400">Aromat · Тәттілік Club 🍞</p>
      </div>
    </main>
  )
}
