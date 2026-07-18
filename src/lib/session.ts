// Клиентская "сессия" — сохранённый номер телефона в localStorage.
// BottomNav держит его в стейте, поэтому после setItem нужно событие,
// иначе вкладка «Мой бонус» продолжает вести на /register (выглядит как разлогин).
export const MY_PHONE_KEY = 'my_phone'
export const MY_PHONE_EVENT = 'my_phone_changed'

export function saveMyPhone(phone: string) {
  localStorage.setItem(MY_PHONE_KEY, phone)
  window.dispatchEvent(new Event(MY_PHONE_EVENT))
}

export function getMyPhone(): string | null {
  return localStorage.getItem(MY_PHONE_KEY)
}
