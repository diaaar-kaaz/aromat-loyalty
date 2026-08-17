-- Пуш-уведомления: таблица токенов устройств.
-- Выполнить один раз в Supabase → SQL Editor.

create table if not exists device_tokens (
  id          uuid primary key default gen_random_uuid(),
  -- APNs device token в hex (64 символа). Один токен = одно устройство.
  token       text not null unique,
  customer_id uuid references customers(id) on delete set null,
  platform    text not null default 'ios',
  -- Тумблер «Уведомления о свежей выпечке» в приложении. Отдельно от системного
  -- разрешения: клиент может разрешить пуши в iOS, но выключить их у нас.
  enabled     boolean not null default true,
  -- Debug-сборки из Xcode получают токен sandbox, App Store/TestFlight — production.
  -- Токены НЕ взаимозаменяемы: отправка не в тот хост даёт BadDeviceToken.
  environment text not null default 'production',
  app_version text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table device_tokens
  drop constraint if exists device_tokens_environment_check;
alter table device_tokens
  add constraint device_tokens_environment_check
  check (environment in ('production', 'sandbox'));

-- Рассылка выбирает токены по enabled + environment.
create index if not exists device_tokens_enabled_idx
  on device_tokens (enabled, environment);

-- Один клиент может держать несколько устройств (телефон + планшет).
create index if not exists device_tokens_customer_idx
  on device_tokens (customer_id);

-- Supabase включает RLS на новых таблицах. Приложение и API ходят под ключом
-- anon, поэтому с включённым RLS и без политик запись падает с 500, а чтение
-- молча возвращает пусто. Выключаем — так же, как у customers и остальных
-- таблиц проекта.
-- ⚠️ Это значит, что таблица доступна публичным ключом anon: список токенов
-- можно прочитать и испортить. Слать пуши по ним нельзя — для этого нужен
-- приватный ключ .p8, который живёт только в переменных окружения Vercel.
-- Если закрывать доступ, то не эту таблицу отдельно, а всю схему разом:
-- service_role на сервере + RLS везде. Полумера тут только путает.
alter table device_tokens disable row level security;
