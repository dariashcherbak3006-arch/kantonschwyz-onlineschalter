'use client'

import { useEffect, useRef, useState } from 'react'
import type { FlatService } from '@/data/services'
import { ExternalIcon } from './icons'
import { useT } from './i18n'

type Link = Pick<FlatService, 'title' | 'href' | 'external'>
type Msg = { role: 'user' | 'assistant'; content: string; links?: Link[]; error?: boolean }

// serviceId set = questions about that service page (page bot); unset = general assistant.
export function useChat(serviceId?: number) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const { lang, t } = useT()

  async function ask(text: string) {
    if (!text.trim() || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: text.trim() }]
    setMessages(next)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, serviceId, messages: next.map(({ role, content }) => ({ role, content })) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages([...next, { role: 'assistant', content: data.reply, links: data.links }])
    } catch {
      setMessages([
        ...next,
        { role: 'assistant', content: t('Der Assistent ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.'), error: true }
      ])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, ask, reset: () => setMessages([]) }
}

export function ChatLog({ messages, loading }: { messages: Msg[]; loading: boolean }) {
  const { t } = useT()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  return (
    <div className="chat" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={`chat__msg chat__msg--${m.role} ${m.role === 'assistant' ? 'glass' : ''}`}>
          <p>
            {/* Who is speaking is otherwise only shown by bubble side and colour */}
            <span className="sr-only">{m.role === 'user' ? t('Sie:') : 'Schwyzi:'} </span>
            {m.content}
          </p>
          {!!m.links?.length && (
            <div className="chat__links">
              {m.links.map((l) => (
                <a key={l.href} href={l.href} className="btn-link">
                  {t(l.title)}
                  {l.external && <ExternalIcon />}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div className="chat__msg chat__msg--assistant glass chat__typing">
          <span />
          <span />
          <span />
          <span className="sr-only">{t('Assistent schreibt')}</span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

const MOODS = ['Hallo', 'Nachdenken', 'Antwort', 'Unverstaendlich']

// All four GIFs stay mounted and only toggle `hidden`, so switching moods never flashes while one loads.
export function Mascot({ messages, loading }: { messages: Msg[]; loading: boolean }) {
  const last = messages.at(-1)
  const mood = loading ? 'Nachdenken' : !last ? 'Hallo' : last.error ? 'Unverstaendlich' : 'Antwort'
  return (
    <div className="mascot" aria-hidden="true">
      {MOODS.map((m) => (
        <img key={m} src={`/Maskottchen_${m}.gif`} alt="" width={520} height={520} hidden={m !== mood} />
      ))}
    </div>
  )
}

export function AiNotice() {
  const { t } = useT()
  return (
    <p className="ai-notice">
      {t('KI-Antworten können fehlerhaft sein.')} <a href="/nutzungsbedingungen">{t('Nutzungsbedingungen')}</a>
    </p>
  )
}
