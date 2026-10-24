'use client'

import { useEffect, useRef, useState } from 'react'
import { ALL_GEMEINDEN } from '@/data/services'
import { CheckIcon } from './icons'
import { useT } from './i18n'

const KEY = 'gemeinde'
const EVENT = 'gemeinde-change'

// "Meine Gemeinde", remembered per browser and shared by search, detail page and forms.
export function useGemeinde() {
  const [gemeinde, setState] = useState('')

  useEffect(() => {
    const read = () => {
      try {
        setState(localStorage.getItem(KEY) ?? '')
      } catch {}
    }
    read()
    addEventListener(EVENT, read)
    return () => removeEventListener(EVENT, read)
  }, [])

  const setGemeinde = (g: string) => {
    setState(g)
    try {
      localStorage.setItem(KEY, g)
    } catch {}
    dispatchEvent(new Event(EVENT))
  }

  return [gemeinde, setGemeinde] as const
}

// Custom menu instead of a native <select>: its popup can't be styled, so this mirrors the language menu.
export function GemeindeSelect() {
  const [gemeinde, setGemeinde] = useGemeinde()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useT()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    addEventListener('keydown', onKey)
    addEventListener('pointerdown', onDown)
    return () => {
      removeEventListener('keydown', onKey)
      removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const pick = (g: string) => (setGemeinde(g), setOpen(false))

  return (
    <div ref={ref} className="lang gemeinde-select">
      <button
        className={`lang__btn glass ${gemeinde ? 'is-active' : ''}`}
        aria-expanded={open}
        aria-controls="gemeinde-menu"
        aria-label={`${t('Meine Gemeinde')}: ${gemeinde || t('Alle Gemeinden')}`}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="icon">
          <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        {gemeinde || t('Alle Gemeinden')}
        <svg className="lang__chevron" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
      {open && (
        <ul id="gemeinde-menu" className="lang__menu">
          {['', ...ALL_GEMEINDEN].map((g) => (
            <li key={g}>
              <button className="lang__opt" aria-current={g === gemeinde ? 'true' : undefined} onClick={() => pick(g)}>
                {g || t('Alle Gemeinden')}
                {g === gemeinde && <CheckIcon />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Sidebar note on detail pages of services only some municipalities offer online
export function Availability({ gemeinden }: { gemeinden: string[] }) {
  const [gemeinde] = useGemeinde()
  const { t } = useT()
  return (
    <div className="availability">
      {gemeinde && (
        <p className={`availability__mine ${gemeinden.includes(gemeinde) ? 'is-yes' : 'is-no'}`}>
          {t(gemeinden.includes(gemeinde) ? 'In Ihrer Gemeinde verfügbar' : 'In Ihrer Gemeinde nicht online verfügbar')}
          {': '}
          <strong>{gemeinde}</strong>
        </p>
      )}
      <details>
        <summary>
          {t('Online verfügbar in')} {gemeinden.length} {t('Gemeinden')}
        </summary>
        <p>{gemeinden.join(', ')}</p>
      </details>
    </div>
  )
}
