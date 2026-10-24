'use client'

import { useEffect, useState } from 'react'
import { useT } from './i18n'

// Round "back to top" button, shown once the hero is scrolled away.
export default function ToTop() {
  const [show, setShow] = useState(false)
  const { t } = useT()

  useEffect(() => {
    const onScroll = () => setShow(scrollY > 300)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [])

  const up = () =>
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  return (
    <button className={`totop glass ${show ? 'totop--show' : ''}`} onClick={up} aria-label={t('Nach oben')} tabIndex={show ? 0 : -1}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true" className="icon">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
