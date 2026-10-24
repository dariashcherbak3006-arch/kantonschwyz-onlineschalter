import type { Metadata } from 'next'
import { T } from '@/components/i18n'
import { ExternalIcon } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Barrierefreiheit – Onlineschalter Kanton Schwyz',
  description: 'Erklärung zur Barrierefreiheit des Onlineschalters nach eCH-0059.'
}

const SUPPORT_URL = 'https://onlineschalter.sz.ch/ExternalServices/EgovHubServicePage/EgovHubServicePage.aspx?externalId=1004'

// Accessibility statement per eCH-0059: drop a limitation here once it is fixed.
const sections: [string, string[]][] = [
  [
    'Standard',
    [
      'Massstab ist der eCH-0059 Accessibility Standard (Version 3.0). Er verlangt die Konformitätsstufe AA der Web Content Accessibility Guidelines (WCAG 2.1).',
      'Der Onlineschalter ist teilweise konform. Grundlage ist eine Selbstprüfung (Stand: Oktober 2026), keine externe Zertifizierung.'
    ]
  ],
  [
    'Bekannte Einschränkungen',
    [
      'Das animierte Maskottchen lässt sich nicht anhalten.',
      'Bei den Erklärvideos sind Untertitel und Audiodeskription noch nicht geprüft.',
      'Übersetzungen ins Französische, Italienische und Englische sind automatisch erstellt. Nicht übersetzte Stellen erscheinen auf Deutsch.',
      'Informationen in Leichter Sprache und in Gebärdensprache sind noch nicht verfügbar.'
    ]
  ],
  ['Barriere melden', ['Stossen Sie auf eine Barriere? Melden Sie sie uns, damit wir sie beheben können.']]
]

export default function AccessibilityPage() {
  return (
    <section className="faq">
      <h1>
        <T>Erklärung zur Barrierefreiheit</T>
      </h1>
      <p className="faq__lead">
        <T>Der Onlineschalter soll für alle Menschen nutzbar sein, auch mit Behinderung.</T>
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
      <p>
        <a href="mailto:info@sz.ch">info@sz.ch</a>
        <br />
        <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
          <T>Support-Formular</T>
          <ExternalIcon />
        </a>
      </p>
    </section>
  )
}
