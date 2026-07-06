'use client'

import { useEffect } from 'react'

// Регистрирует service worker (/sw.js) — нужно, чтобы сайт был устанавливаемым
// PWA и его можно было упаковать в Android-приложение через PWABuilder (TWA).
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}
