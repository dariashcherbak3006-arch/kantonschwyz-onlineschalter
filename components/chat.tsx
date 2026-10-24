'use client'

import { useEffect, useRef, useState } from 'react'
import type { FlatService } from '@/data/services'
import { ExternalIcon } from './icons'
import { useT } from './i18n'

type Link = Pick<FlatService, 'title' | 'href' | 'external'>
type Msg = { role: 'user' | 'assistant'; content: string; links?: Link[] }

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
        { role: 'assistant', content: t('Der Assistent ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.') }
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
          <p>{m.content}</p>
          {!!m.links?.length && (
            <div className="chat__links">
              {m.links.map((l) => (
                <a key={l.href} href={l.href} className="btn-link">
                  {l.title}
                  {l.external && <ExternalIcon />}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      {loading && (
        <div className="chat__msg chat__msg--assistant glass chat__typing" aria-label={t('Assistent schreibt')}>
          <span />
          <span />
          <span />
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}

export function AiNotice() {
  const { t } = useT()
  return (
    <p className="ai-notice">
      {t('KI-Antworten können fehlerhaft sein. Verbindlich sind die Angaben der zuständigen Stelle.')}
    </p>
  )
}
