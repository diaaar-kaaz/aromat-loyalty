# Пуш-уведомления Aromat — что осталось сделать вручную

Код готов. Ниже — шаги, которые требуют доступов владельца.

---

## 1. Ключ APNs в Apple Developer

1. https://developer.apple.com/account → **Certificates, Identifiers & Profiles** → **Keys** → **+**
2. Имя: `Aromat APNs`, галка **Apple Push Notifications service (APNs)** → Continue → Register
3. **Download** — файл `AuthKey_XXXXXXXXXX.p8`

⚠️ Скачать можно **только один раз**. Потеряешь — придётся отзывать ключ и делать новый.
Сохрани рядом с ключом App Store Connect: `~/.appstoreconnect/private_keys/`

Из этой же страницы понадобятся:
- **Key ID** — 10 символов в имени файла (`AuthKey_A1B2C3D4E5.p8` → `A1B2C3D4E5`)
- **Team ID** — `3RRH6Z325G` (уже известен)

---

## 2. Таблица в Supabase

Supabase → SQL Editor → выполнить [`supabase-push-migration.sql`](supabase-push-migration.sql).

---

## 3. Переменные окружения на Vercel

Project Settings → Environment Variables (все — Production):

| Имя | Значение |
|---|---|
| `APNS_KEY_ID` | Key ID из шага 1 |
| `APNS_TEAM_ID` | `3RRH6Z325G` |
| `APNS_BUNDLE_ID` | `kz.aromat.loyalty` |
| `APNS_PRIVATE_KEY` | **всё содержимое** файла `.p8`, вместе со строками `-----BEGIN PRIVATE KEY-----` и `-----END PRIVATE KEY-----` |

`ADMIN_PASSWORD` уже есть — им же защищён экран рассылки.

⚠️ После добавления переменных нужен **редеплой** — на лету Vercel их не подхватывает.

---

## 4. Сборка и загрузка 1.1 (build 3)

Версия в pbxproj уже поднята: `MARKETING_VERSION = 1.1`, `CURRENT_PROJECT_VERSION = 3`.
Билд 2 от 2 августа так и не отправлялся на ревью, поэтому поезд 1.1 открыт —
отдельная 1.2 не нужна, и одним ревью проедут и июльские фиксы, и пуши.

```bash
cd ~/Desktop/workkk/aromat-ios
xcodebuild -project AromatLoyalty.xcodeproj -scheme AromatLoyalty \
  -sdk iphoneos -configuration Release archive \
  -archivePath ~/Desktop/workkk/aromat-build/AromatLoyalty.xcarchive
```
Дальше — экспорт .ipa и загрузка тем же способом, что и в прошлый раз:
```bash
xcrun altool --upload-app -f ~/Desktop/workkk/aromat-build/AromatLoyalty.ipa -t ios \
  --apiKey A3M6T8C9R2 --apiIssuer d9a09199-944d-48c7-841e-f203ccef704c
```

При первой сборке Xcode сам добавит capability Push Notifications к App ID
(подпись автоматическая). Если ругнётся на профиль — открыть проект в Xcode,
Signing & Capabilities, и дать ему перевыпустить профиль.

---

## 5. В App Store Connect

- **App Privacy** → добавить тип данных **Identifiers → Device ID**:
  используется для **App Functionality**, связан с пользователем — да, для трекинга — **нет**.
- **App Review Notes** → вставить текст из [`APP_STORE_LISTING.md`](APP_STORE_LISTING.md)
  и **подставить туда пароль администратора** (в файле его нет — репозиторий публичный).
  Скрытый вход обязательно описать: Apple снимает с ревью недокументированные функции.
- Привязать build 3 к версии 1.1 → Submit for Review.

---

## 6. Проверка после деплоя

**До релиза** можно проверить весь тракт на своём телефоне:

1. Собрать Debug-сборку из Xcode на реальный iPhone (симулятор пуши не принимает).
2. Разрешить уведомления при регистрации.
3. Долгое нажатие на «AROMAT» → пароль → счётчик «1 устройство».
4. Отправить тестовое — баннер должен прийти за пару секунд.

Debug-сборка регистрируется как `sandbox`, App Store — как `production`;
сервер шлёт каждую группу на свой хост Apple, так что тест не мешает боевым.

Если пуш не пришёл, смотреть в логах функции причину от Apple:
- `BadDeviceToken` — токен не из того окружения (sandbox против production)
- `InvalidProviderToken` — неверный Key ID / Team ID / битый `.p8`
- `TopicDisallowed` — `APNS_BUNDLE_ID` не совпадает с bundle приложения

---

## Как отправлять рассылку

Главная → долгое нажатие (~1,5 сек) на «AROMAT» → пароль администратора →
заголовок + текст (или заготовка в один тап) → «Отправить всем» → подтвердить.

Отменить отправленное невозможно, поэтому перед отправкой показывается
подтверждение с полным текстом и числом получателей.
