'use client'

import { useEffect, useState } from 'react'
import { ALL_GEMEINDEN } from '@/data/services'
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

export function GemeindeSelect() {
  const [gemeinde, setGemeinde] = useGemeinde()
  const { t } = useT()
  return (
    <label className="gemeinde-select glass">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="icon">
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      <span className="sr-only">{t('Meine Gemeinde')}</span>
      <select value={gemeinde} onChange={(e) => setGemeinde(e.target.value)}>
        <option value="">{t('Alle Gemeinden')}</option>
        {ALL_GEMEINDEN.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>
    </label>
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
