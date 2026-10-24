import type { Metadata } from 'next'
import { T } from '@/components/i18n'

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen – Onlineschalter Kanton Schwyz',
  description: 'Diese Seite ist eine Testumgebung.'
}

const sections: [string, string[]][] = [
  ['Testumgebung', ['Dieser Onlineschalter ist ein Prototyp. Er dient ausschliesslich dazu, die Dienstleistungen des Kantons Schwyz zu testen.']],
  [
    'KI-Assistent',
    [
      'Nutzen Sie den KI-Assistenten nur, um den Onlineschalter des Kantons Schwyz zu testen. Jede andere Nutzung ist nicht gestattet.',
      'KI-Antworten können fehlerhaft sein. Verbindlich sind die Angaben der zuständigen Stelle.'
    ]
  ],
  ['Ihre Daten', ['Geben Sie keine echten Personendaten oder vertraulichen Informationen ein.']]
]

export default function TermsPage() {
  return (
    <section className="faq">
      <h1>
        <T>Nutzungsbedingungen</T>
      </h1>
      <p className="faq__lead">
        <T>Diese Seite ist eine Testumgebung.</T>
      </p>
      {sections.map(([title, texts]) => (
        <div key={title}>
          <h2>
            <T>{title}</T>
          </h2>
          {texts.map((text) => (
            <p key={text}>
              <T>{text}</T>
            </p>
          ))}
        </div>
      ))}
    </section>
  )
}
