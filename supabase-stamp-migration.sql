-- Штамп-карты: добавляем два поля в таблицу customers.
-- Выполнить один раз в Supabase → SQL Editor.

alter table customers
  add column if not exists stamp_category text,
  add column if not exists stamp_count    integer not null default 0;

-- Допустимые категории карт (защита от мусора).
alter table customers
  drop constraint if exists customers_stamp_category_check;
alter table customers
  add constraint customers_stamp_category_check
  check (stamp_category is null or stamp_category in ('coffee', 'pastry', 'dessert'));
