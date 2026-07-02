import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Aromat',
  description: 'Как приложение лояльности Aromat собирает и использует ваши данные.',
}

const UPDATED = '2 июля 2026'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F4] px-5 py-10 text-[#2C1810]">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-extrabold text-[#C46245]">Политика конфиденциальности</h1>
        <p className="mt-2 text-sm text-gray-500">Программа лояльности Aromat · обновлено {UPDATED}</p>

        <p className="mt-6 leading-relaxed">
          Пекарня Aromat («мы») уважает вашу конфиденциальность. Этот документ объясняет, какие данные
          собирает приложение и сайт программы лояльности Aromat, зачем и как мы их используем.
        </p>

        <Section title="1. Какие данные мы собираем">
          <ul className="list-disc space-y-1 pl-5">
            <li>Имя, которое вы указываете при регистрации.</li>
            <li>Номер телефона — используется как идентификатор вашей бонусной карты.</li>
            <li>Данные о покупках: суммы чеков, начисленные и списанные баллы, ваш уровень.</li>
            <li>Прогресс по накопительным картам (штампам).</li>
          </ul>
          <p className="mt-3">
            Мы не собираем платёжные данные, геолокацию, контакты или иную информацию с вашего устройства.
          </p>
        </Section>

        <Section title="2. Зачем мы используем данные">
          <p>
            Только для работы программы лояльности: идентификации вашей карты, начисления и списания
            баллов, расчёта уровня и накопительных подарков. Мы не используем данные для рекламы третьих лиц.
          </p>
        </Section>

        <Section title="3. Где хранятся данные">
          <p>
            Данные хранятся в защищённой облачной базе данных (Supabase) и обслуживаются через хостинг
            Vercel. Передача данных происходит по защищённому соединению (HTTPS).
          </p>
        </Section>

        <Section title="4. Передача третьим лицам">
          <p>
            Мы не продаём и не передаём ваши данные третьим лицам. Данные обрабатываются только нами и
            техническими поставщиками инфраструктуры (Supabase, Vercel), необходимыми для работы сервиса.
          </p>
        </Section>

        <Section title="5. Срок хранения">
          <p>
            Мы храним данные, пока вы участвуете в программе лояльности. Вы можете попросить удалить свой
            аккаунт и связанные данные в любой момент — см. контакты ниже.
          </p>
        </Section>

        <Section title="6. Ваши права">
          <p>
            Вы можете запросить доступ к своим данным, их исправление или полное удаление. Для этого
            свяжитесь с нами по контактам ниже, и мы выполним запрос в разумный срок.
          </p>
        </Section>

        <Section title="7. Изменения политики">
          <p>
            Мы можем обновлять эту политику. Актуальная версия всегда доступна на этой странице с указанием
            даты обновления.
          </p>
        </Section>

        <Section title="8. Контакты">
          <ul className="space-y-1">
            <li>Телефон: <a className="text-[#C46245] underline" href="tel:+77715297049">+7 771 529 70 49</a></li>
            <li>Email: <a className="text-[#C46245] underline" href="mailto:dkazzzbekov@gmail.com">dkazzzbekov@gmail.com</a></li>
            <li>Instagram: <a className="text-[#C46245] underline" href="https://instagram.com/aromatbakery">@aromatbakery</a></li>
            <li>Адрес: Тауелсыздык 23, Астана, Казахстан</li>
          </ul>
        </Section>

        <p className="mt-10 text-center text-sm text-gray-400">Aromat · Тәттілік Club 🥐</p>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-lg font-bold text-[#2C1810]">{title}</h2>
      <div className="mt-2 leading-relaxed text-gray-700">{children}</div>
    </section>
  )
}
