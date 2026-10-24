import type { Metadata } from 'next'
import { T } from '@/components/i18n'
import Videos from '@/components/Videos'

export const metadata: Metadata = {
  title: 'FAQ – Onlineschalter Kanton Schwyz',
  description: 'Häufige Fragen zum Onlineschalter, zum Konto und zum AGOV-Login.'
}

// Content based on https://onlineschalter.sz.ch/de/Onlinehilfe.html
const sections = [
  {
    id: 'allgemeines',
    title: 'Allgemeines',
    items: [
      ['Was ist der Onlineschalter Kanton Schwyz?', 'Der Onlineschalter bündelt digitale Dienstleistungen von Kanton, Bezirken und Gemeinden. So erledigen Sie Behördengänge online, rund um die Uhr.'],
      ['Ersetzt der Onlineschalter die Webseiten von Kanton und Gemeinden?', 'Nein. Die Webseiten von Kanton und Gemeinden bleiben für Informationen bestehen. Der Onlineschalter ist der Zugang zu den digitalen Dienstleistungen.'],
      ['Kann ich den Onlineschalter auch ohne Wohnsitz im Kanton nutzen?', 'Ja. Nutzung und Registrierung stehen allen offen.'],
      ['An wen richtet sich der Onlineschalter?', 'Aktuell an Privatpersonen. Ein Angebot für Unternehmen ist in einem späteren Schritt geplant.'],
      ['Wohin wende ich mich bei Fragen zu einer Dienstleistung?', 'Wenden Sie sich direkt an die zuständige Behörde oder nutzen Sie das Support-Formular.']
    ]
  },
  {
    id: 'konto',
    title: 'Konto & AGOV-Login',
    items: [
      ['Brauche ich ein Konto, um eine Dienstleistung zu nutzen?', 'Viele Dienstleistungen funktionieren ohne Konto. Wo eines nötig ist, wird das bei der Dienstleistung angezeigt.'],
      ['Warum brauchen gewisse Dienstleistungen ein Konto?', 'Nur wenn Ihre Identität geprüft werden muss oder eine gesetzliche Vorgabe besteht.'],
      ['Ist die Registrierung kostenlos?', 'Ja, das Konto ist kostenlos. Einzelne Dienstleistungen können Gebühren haben.'],
      ['Welche Vorteile hat ein Konto?', 'Sie nutzen alle Dienstleistungen online und sehen jederzeit den Stand Ihrer Gesuche.'],
      ['Was ist AGOV?', 'AGOV ist das Behörden-Login der Schweiz. Damit melden Sie sich sicher bei Online-Diensten von Bund, Kantonen und Gemeinden an.'],
      ['Wie erstelle ich ein Konto?', 'Klicken Sie oben rechts auf «Login» und melden Sie sich mit AGOV an. Verlangt eine Dienstleistung ein Konto, werden Sie automatisch durch die Registrierung geführt.'],
      ['Wie ändere ich meine Kontodaten?', 'Ihre persönlichen Angaben verwalten Sie direkt bei AGOV unter me.agov.ch.'],
      ['Wie lösche ich mein Konto?', 'Melden Sie sich an, öffnen Sie die Übersicht Ihrer persönlichen Daten und wählen Sie «Konto löschen».'],
      ['Wie lange bleibt mein Konto aktiv?', 'Solange Sie es nutzen. Nach drei Jahren ohne Anmeldung wird es deaktiviert.']
    ]
  },
  {
    id: 'dienstleistungen',
    title: 'Dienstleistungen',
    items: [
      ['Wie finde ich die passende Dienstleistung?', 'Nutzen Sie die Suche oder den KI-Assistenten auf der Startseite, oder stöbern Sie über die Themen im Menü.'],
      ['Ich finde eine Dienstleistung nicht. Was kann ich tun?', 'Das Angebot wird laufend ausgebaut. Schlagen Sie die gewünschte Dienstleistung über das Feedback-Formular vor.'],
      ['Sind die Dienstleistungen kostenlos?', 'Viele ja. Allfällige Gebühren werden bei der Dienstleistung angezeigt.'],
      ['Wie kann ich bezahlen?', 'Mit Visa, Mastercard, PostFinance Pay, TWINT, Apple Pay, Samsung Pay oder Google Pay. Die verfügbaren Optionen sehen Sie vor der Zahlung.']
    ]
  },
  {
    id: 'sicherheit',
    title: 'Sicherheit',
    items: [
      ['Wie sicher sind meine Daten?', 'Es werden nur nötige Daten erhoben. Sie werden verschlüsselt übertragen und gespeichert, liegen auf gesicherten Servern unter Kontrolle des Kantons und werden regelmässig auf Schwachstellen geprüft.'],
      ['Wie sicher ist das AGOV-Login?', 'AGOV erfüllt die Sicherheitsstandards des Bundes und nutzt eine zusätzliche Bestätigung, etwa über die AGOV-access-App oder einen Sicherheitsschlüssel.']
    ]
  }
]

export default function FaqPage() {
  return (
    <section className="faq">
      <h1>
        <T>Häufige Fragen</T>
      </h1>
      <p className="faq__lead">
        <T>Antworten rund um den Onlineschalter, Ihr Konto und das AGOV-Login.</T>
      </p>
      <h2 id="videos">
        <T>Erklärvideos</T>
      </h2>
      <Videos />
      {sections.map((sec) => (
        <div key={sec.id}>
          <h2 id={sec.id}>
            <T>{sec.title}</T>
          </h2>
          {sec.items.map(([q, a]) => (
            <details key={q} className="glass">
              <summary>
                <T>{q}</T>
              </summary>
              <p>
                <T>{a}</T>
              </p>
            </details>
          ))}
        </div>
      ))}
    </section>
  )
}
