'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { searchServices } from '@/data/services'
import { CheckIcon, ExternalIcon, GlobeIcon, SearchIcon, UserIcon } from './icons'
import { LANGS, LANG_NAMES, useT } from './i18n'

export default function Header() {
  const [searching, setSearching] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const login = useRef<HTMLDialogElement>(null)
  const path = usePathname()
  const { lang, setLang, t } = useT()
  // Home has the big hero search; every other page gets it in the header.
  const showSearch = path !== '/'

  // ponytail: click-only menu (no hover) so touch and mouse behave the same.
  useEffect(() => {
    const close = () => (setSearching(false), setLangOpen(false))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close()
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <header ref={ref} className="site-header">
      <div className="site-header__bar">
        <a href="/" className="site-header__logo" aria-label={t('Onlineschalter Kanton Schwyz, Startseite')}>
          <img src="/logo.svg" alt="Kanton Schwyz" width={254} height={35} />
          <span className="site-header__name">Onlineschalter</span>
        </a>

        {showSearch && (
          <button
            className="site-header__search-btn glass"
            aria-expanded={searching}
            aria-controls="header-search"
            aria-label={t('Suche öffnen')}
            onClick={() => (setSearching(!searching), setLangOpen(false))}
          >
            <SearchIcon />
          </button>
        )}
        {searching && (
          <div id="header-search" className="mega mega--search">
            <SearchBox id="header-q" autoFocus />
          </div>
        )}

        <TextSize />

        <a href="/faq" className="textsize glass">
          FAQ
        </a>

        <div className="lang">
          <button
            className="lang__btn glass"
            aria-expanded={langOpen}
            aria-controls="lang-menu"
            aria-label={`${t('Sprache')}: ${LANG_NAMES[lang]}`}
            onClick={() => (setLangOpen(!langOpen), setSearching(false))}
          >
            <GlobeIcon />
            {lang.toUpperCase()}
            <svg className="lang__chevron" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          {langOpen && (
            <ul id="lang-menu" className="lang__menu">
              {LANGS.map((l) => (
                <li key={l}>
                  <button
                    className="lang__opt"
                    lang={l}
                    aria-current={l === lang ? 'true' : undefined}
                    onClick={() => (setLang(l), setLangOpen(false))}
                  >
                    <span className="lang__code">{l.toUpperCase()}</span>
                    {LANG_NAMES[l]}
                    {l === lang && <CheckIcon />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="site-header__login" onClick={() => login.current?.showModal()}>
          <UserIcon />
          <span className="site-header__login-text">{t('Login')}</span>
        </button>

        {/* showModal() makes the rest of the page inert until the dialog closes */}
        <dialog ref={login} className="login glass" aria-labelledby="login-title">
          <button className="login__close" aria-label={t('Schliessen')} onClick={() => login.current?.close()}>
            ×
          </button>
          <h2 id="login-title">{t('Einloggen')}</h2>
          <p>
            {t(
              'Melden Sie sich mit AGOV an, dem Behörden-Login der Schweiz. Damit erhalten Sie sicheren Zugang zu Ihrem Konto und allen Dienstleistungen des Onlineschalters.'
            )}
          </p>
          <a className="login__agov" href="https://auth.agov.admin.ch/SAML2/SSO/">
            {t('Mit AGOV anmelden')}
          </a>
          <a className="login__more" href="/faq#konto" onClick={() => login.current?.close()}>
            {t('Was ist AGOV?')}
          </a>
        </dialog>
      </div>
    </header>
  )
}

function SearchBox({ id, autoFocus }: { id: string; autoFocus?: boolean }) {
  const [q, setQ] = useState('')
  const { t } = useT()
  const hits = q.trim() ? searchServices(q, t).slice(0, 8) : []

  return (
    <form
      role="search"
      className="hsearch"
      onSubmit={(e) => {
        e.preventDefault()
        if (hits[0]) location.href = hits[0].href
      }}
    >
      <div className="searchbar glass">
        <span className="searchbar__icon">
          <SearchIcon />
        </span>
        <label htmlFor={id} className="sr-only">
          {t('Dienstleistung suchen')}
        </label>
        <input
          id={id}
          autoFocus={autoFocus}
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('z. B. Umzug, Steuern, Hund …')}
        />
        {q && (
          <button
            type="button"
            className="searchbar__clear"
            aria-label={t('Eingabe löschen')}
            onClick={() => (setQ(''), document.getElementById(id)?.focus())}
          >
            ×
          </button>
        )}
      </div>
      {!!q.trim() &&
        (hits.length ? (
          <ul className="hsearch__results">
            {hits.map((sv) => (
              <li key={sv.id}>
                <a href={sv.href} className="mega__link">
                  <span className="service__group">{t(sv.group)}</span>
                  {t(sv.title)}
                  {sv.external && <ExternalIcon />}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hsearch__empty">{t('Keine Treffer')}</p>
        ))}
    </form>
  )
}

// Content zoom for people who read better with larger text; the header stays fixed-size so it never overflows.
// One toggle: Aa+ while text is normal, Aa− while it's enlarged.
const LARGE = 1.3

function TextSize() {
  const [large, setLarge] = useState(false)
  const { t } = useT()

  useEffect(() => {
    try {
      setLarge(localStorage.getItem('textLarge') === '1')
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(large ? LARGE : 1))
  }, [large])

  const toggle = () => {
    setLarge(!large)
    try {
      localStorage.setItem('textLarge', large ? '0' : '1')
    } catch {}
  }

  return (
    <button
      className="textsize glass"
      onClick={toggle}
      aria-label={t(large ? 'Schrift verkleinern' : 'Schrift vergrössern')}
    >
      Aa<span aria-hidden="true">{large ? '−' : '+'}</span>
    </button>
  )
}
