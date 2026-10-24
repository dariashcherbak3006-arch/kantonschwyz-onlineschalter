'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { SendIcon, SparkIcon } from './icons'
import { useT } from './i18n'
import { AiNotice, ChatLog, useChat } from './chat'

const SUGGESTIONS = ['Welche Unterlagen brauche ich?', 'Was kostet das?', 'Wie lange dauert es?']

// Floating assistant that answers questions about one service page.
export default function PageBot({ serviceId }: { serviceId: number }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, loading, ask } = useChat(serviceId)
  const { t } = useT()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function send(text: string) {
    ask(text)
    setInput('')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  return (
    <>
      {open && (
        <div id="page-bot" className="bot glass" role="dialog" aria-label={t('Fragen zu dieser Seite')}>
          <div className="bot__head">
            <SparkIcon />
            <strong>{t('Fragen zu dieser Seite')}</strong>
            <button className="login__close" aria-label={t('Schliessen')} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          <AiNotice />
          <div className="bot__body">
            {messages.length ? (
              <ChatLog messages={messages} loading={loading} />
            ) : (
              <>
                <p className="bot__hint">{t('Stellen Sie eine Frage zu dieser Dienstleistung.')}</p>
                <div className="chips">
                  {SUGGESTIONS.map((sg) => (
                    <button key={sg} className="chip glass" onClick={() => send(t(sg))}>
                      {t(sg)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <form className="bot__form" onSubmit={onSubmit}>
            <label htmlFor="bot-q" className="sr-only">
              {t('Frage an den KI-Assistenten')}
            </label>
            <input
              id="bot-q"
              autoFocus
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('Stellen Sie Ihre Frage …')}
            />
            <button type="submit" className="searchbar__send" disabled={!input.trim() || loading} aria-label={t('Senden')}>
              <SendIcon />
            </button>
          </form>
        </div>
      )}
      <button
        className="bot-fab"
        aria-expanded={open}
        aria-controls="page-bot"
        aria-label={t('KI-Assistent öffnen')}
        onClick={() => setOpen(!open)}
      >
        <SparkIcon />
      </button>
    </>
  )
}
