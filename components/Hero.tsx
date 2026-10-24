'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { topics, services, searchServices, type Level } from '@/data/services'
import { ExternalIcon, GridIcon, ListIcon, SearchIcon, SendIcon, SparkIcon, topicIcons } from './icons'
import { useT } from './i18n'
import { AiNotice, ChatLog, Mascot, useChat } from './chat'
import { LevelBadge } from './i18n'
import { GemeindeSelect, useGemeinde } from './gemeinde'
import { LEBENSLAGEN } from '@/data/lebenslagen'
import { ClockIcon, CoinIcon, LifeIcon } from './icons'

const SUGGESTIONS = ['Umzug melden', 'Frist Steuererklärung', 'Hund anmelden', 'Diebstahl melden', 'Strafregisterauszug']

export default function Hero() {
  const [mode, setMode] = useState<'search' | 'ai'>('search')
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<Level | 'all'>('all')
  // Active life situation chip: shows only the services that help in that situation
  const [life, setLife] = useState<string | null>(null)
  const [gemeinde, setGemeinde] = useGemeinde()
  const { messages, loading, ask, reset } = useChat()
  const { t } = useT()

  const chatting = mode === 'ai' && messages.length > 0

  // "/#ki" (help card in the footer) opens the assistant
  useEffect(() => {
    const open = () => {
      if (location.hash !== '#ki') return
      setMode('ai')
      scrollTo({ top: 0 })
      document.getElementById('q')?.focus({ preventScroll: true })
    }
    open()
    addEventListener('hashchange', open)
    return () => removeEventListener('hashchange', open)
  }, [])

  function send(text: string) {
    ask(text)
    setQuery('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'ai') send(query)
  }

  const lifeCase = LEBENSLAGEN.find((l) => l.slug === life)
  const lifeIds = lifeCase?.steps.flatMap((s) => s.services ?? []) ?? []
  const base = lifeCase ? services.filter((sv) => lifeIds.includes(sv.id)) : searchServices(query, t)
  const hits = base.filter(
    (sv) => (level === 'all' || sv.level === level) && (!gemeinde || !sv.gemeinden || sv.gemeinden.includes(gemeinde))
  )

  const filtered = !!(query || life || gemeinde || level !== 'all')
  function resetFilters() {
    setQuery('')
    setLife(null)
    setLevel('all')
    setGemeinde('')
  }

  // Shortcut: show all services, then scroll to the topic's section
  function jump(i: number) {
    setMode('search')
    setQuery('')
    setLevel('all')
    setLife(null)
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() =>
      document.getElementById(`topic-${i}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
    )
  }

  // Jump to a life situation's accordion and open it
  function openLife(slug: string) {
    const el = document.getElementById(`life-${slug}`) as HTMLDetailsElement | null
    if (el) el.open = true
  }

  return (
    <section className={`hero ${chatting ? 'hero--chat' : ''}`}>
      {!chatting && (
        <nav className="shortcuts" aria-label={t('Themen-Schnellzugriff')}>
          {topics.map((topic, i) => {
            const Icon = topicIcons[topic.title]
            return (
              <button key={topic.title} className="shortcut glass" onClick={() => jump(i)}>
                <Icon />
                {t(topic.title)}
              </button>
            )
          })}
        </nav>
      )}

      {!chatting && (
        <div className="hero__intro">
          <h1>{t('Wie können wir Ihnen helfen?')}</h1>
          <p>{t('Alle Online-Dienstleistungen des Kantons Schwyz an einem Ort.')}</p>
        </div>
      )}

      <div className="mode-switch glass" role="radiogroup" aria-label={t('Suchmodus')}>
        {(['search', 'ai'] as const).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            className="mode-switch__opt"
            onClick={() => setMode(m)}
          >
            {m === 'search' ? <SearchIcon /> : <SparkIcon />}
            {t(m === 'search' ? 'Suche' : 'KI-Assistent')}
          </button>
        ))}
      </div>

      {chatting && <ChatLog messages={messages} loading={loading} />}

      <div className={`searchrow ${chatting ? 'searchrow--docked' : ''}`}>
        <form className="searchbar glass" onSubmit={onSubmit} role="search">
          <label htmlFor="q" className="sr-only">
            {t(mode === 'ai' ? 'Frage an den KI-Assistenten' : 'Dienstleistung suchen')}
          </label>
          <span className="searchbar__icon">{mode === 'ai' ? <SparkIcon /> : <SearchIcon />}</span>
          <input
            id="q"
            autoComplete="off"
            value={query}
            onChange={(e) => (setQuery(e.target.value), setLife(null))}
            placeholder={t(mode === 'ai' ? 'Frag Schwyzi …' : 'z. B. Umzug, Steuern, Hund …')}
          />
          {(query || (mode === 'search' && life)) && (
            <button
              type="button"
              className="searchbar__clear"
              aria-label={t('Eingabe löschen')}
              onClick={() => (setQuery(''), setLife(null), document.getElementById('q')?.focus())}
            >
              ×
            </button>
          )}
          {mode === 'ai' && (
            <button type="submit" className="searchbar__send" disabled={!query.trim() || loading} aria-label={t('Senden')}>
              <SendIcon />
            </button>
          )}
        </form>
        {mode === 'ai' && <Mascot messages={messages} loading={loading} />}
      </div>

      {mode === 'search' && (
        <nav className="chips" aria-label={t('Lebenslagen')}>
          {LEBENSLAGEN.map((l) => (
            <button
              key={l.slug}
              className="chip glass"
              aria-pressed={life === l.slug}
              onClick={() => (setLife(life === l.slug ? null : l.slug), setQuery(''))}
            >
              <LifeIcon icon={l.icon} />
              {t(l.title)}
            </button>
          ))}
        </nav>
      )}

      {mode === 'ai' && <AiNotice />}

      {chatting && (
        <button className="chat__reset" onClick={reset}>
          {t('Neuer Chat')}
        </button>
      )}

      {mode === 'ai' && !chatting && (
        <div className="chips">
          {SUGGESTIONS.map((sg) => (
            <button key={sg} className="chip glass" onClick={() => send(t(sg))}>
              {t(sg)}
            </button>
          ))}
        </div>
      )}

      {mode === 'search' && (
        <div className="results">
          <h2 className="results__title">{t('Liste der Dienstleistungen')}</h2>
          <div className="results__bar">
            <p>
              {hits.length} {t(hits.length === 1 ? 'Dienstleistung' : 'Dienstleistungen')}
            </p>
            {filtered && (
              <button className="results__reset" onClick={resetFilters}>
                × {t('Filter zurücksetzen')}
              </button>
            )}
            <GemeindeSelect />
            <div className="view-toggle glass" role="radiogroup" aria-label={t('Zuständigkeit')}>
              {(['all', 'kommunal', 'kantonal'] as const).map((l) => (
                <button key={l} role="radio" aria-checked={level === l} onClick={() => setLevel(l)}>
                  {t(l === 'all' ? 'Alle' : l === 'kommunal' ? 'Kommunal' : 'Kantonal')}
                </button>
              ))}
            </div>
            <div className="view-toggle glass" role="radiogroup" aria-label={t('Ansicht')}>
              <button role="radio" aria-checked={view === 'cards'} onClick={() => setView('cards')}>
                <GridIcon /> {t('Kacheln')}
              </button>
              <button role="radio" aria-checked={view === 'list'} onClick={() => setView('list')}>
                <ListIcon /> {t('Liste')}
              </button>
            </div>
          </div>

          {lifeCase && (
            <div className="life__active glass">
              <LifeIcon icon={lifeCase.icon} />
              <p>
                <strong>{t(lifeCase.title)}:</strong> {t(lifeCase.intro)}{' '}
                <a href={`#life-${lifeCase.slug}`} onClick={() => openLife(lifeCase.slug)}>
                  {t('Was ist zu tun?')}
                </a>
              </p>
              <button className="login__close" aria-label={t('Schliessen')} onClick={() => setLife(null)}>
                ×
              </button>
            </div>
          )}

          {!hits.length && lifeCase && (
            <p className="results__empty">{t('Für diese Lebenslage gibt es noch keine Online-Dienstleistungen. Hinweise finden Sie unten.')}</p>
          )}
          {!hits.length && !lifeCase && <p className="results__empty">{t('Keine Dienstleistung gefunden. Versuchen Sie es mit dem KI-Assistenten.')}</p>}

          {topics.map((topic, i) => {
            const items = hits.filter((h) => h.topic === topic.title)
            if (!items.length) return null
            const Icon = topicIcons[topic.title]
            return (
              <div key={topic.title} id={`topic-${i}`} className="results__topic">
                <h3>
                  <Icon />
                  {t(topic.title)}
                </h3>
                <ul className={view === 'cards' ? 'grid' : 'rows'}>
                  {items.map((sv) => (
                    <li key={sv.id}>
                      <a href={sv.href} className="service glass">
                        <span className="service__meta">
                          <span className="service__group">{t(sv.group)}</span>
                          <LevelBadge level={sv.level} />
                        </span>
                        <span className="service__title">
                          {t(sv.title)}
                          {sv.external && <ExternalIcon />}
                        </span>
                        <span className="service__desc">{t(sv.desc)}</span>
                        {(sv.dauer || sv.kosten) && (
                          <span className="service__facts">
                            {sv.dauer && (
                              <span>
                                <ClockIcon />
                                <span className="sr-only">{t('Bearbeitungsdauer')}:</span>
                                {t(sv.dauer)}
                              </span>
                            )}
                            {sv.kosten && (
                              <span>
                                <CoinIcon />
                                <span className="sr-only">{t('Kosten')}:</span>
                                {t(sv.kosten)}
                              </span>
                            )}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          <section className="life" aria-labelledby="life-title">
            <h2 id="life-title">{t('Lebenslagen')}</h2>
            <p className="life__lead">{t('Was ist zu tun? Schritt für Schritt durch typische Situationen.')}</p>
            {LEBENSLAGEN.map((l) => (
              <details key={l.slug} id={`life-${l.slug}`} className="life__item glass">
                <summary>
                  <LifeIcon icon={l.icon} />
                  {t(l.title)}
                </summary>
                <div className="life__body">
                  <p className="life__intro">{t(l.intro)}</p>
                  <ol className="timeline">
                    {l.steps.map((s) => (
                      <li key={s.title} className="timeline__step">
                        <h3>{t(s.title)}</h3>
                        <p>{t(s.text)}</p>
                        {!!(s.services?.length || s.links?.length) && (
                          <div className="chat__links">
                            {s.services?.map((id) => {
                              const sv = services.find((x) => x.id === id)!
                              return (
                                <a key={id} href={sv.href} className="btn-link">
                                  {t(sv.title)}
                                  {sv.external && <ExternalIcon />}
                                </a>
                              )
                            })}
                            {s.links?.map((ln) => (
                              <a key={ln.href} href={ln.href} className="btn-link" target="_blank" rel="noopener noreferrer">
                                {t(ln.label)}
                                <ExternalIcon />
                              </a>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            ))}
            <p className="ai-notice life__notice">
              {t('Allgemeine Orientierung. Verbindlich sind die Angaben der zuständigen Stellen.')}
            </p>
          </section>
        </div>
      )}
    </section>
  )
}
