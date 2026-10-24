// Life situations: what to do next, linking to the Schalter services that cover each step.
// General guidance only; binding information comes from the responsible offices.

export type LebenslageStep = {
  title: string
  text: string
  services?: number[]
  links?: { label: string; href: string }[]
}

export type Lebenslage = {
  slug: string
  title: string
  icon: 'umzug' | 'firma' | 'kind' | 'hund' | 'auto' | 'polizei'
  intro: string
  steps: LebenslageStep[]
}

export const LEBENSLAGEN: Lebenslage[] = [
  {
    slug: 'umzug',
    title: 'Ich ziehe um',
    icon: 'umzug',
    intro:
      'Beim Umzug melden Sie sich bei der bisherigen Gemeinde ab und bei der neuen Gemeinde an. Vieles davon erledigen Sie online.',
    steps: [
      {
        title: 'Umzug melden',
        text: 'Melden Sie Wegzug und Zuzug in der Regel innert 14 Tagen nach dem Umzug. Mit eUmzug geht das online in einem Schritt.',
        services: [24]
      },
      {
        title: 'Wohnsitz bestätigen lassen',
        text: 'Brauchen Sie einen Nachweis für Arbeitgeber, Bank oder Behörden, bestellen Sie eine Wohnsitzbestätigung bei Ihrer neuen Gemeinde.',
        services: [47]
      },
      {
        title: 'Hund ummelden',
        text: 'Ziehen Sie mit einem Hund um, melden Sie ihn bei der neuen Gemeinde an und bei der bisherigen ab.',
        services: [45, 44]
      },
      {
        title: 'Fahrzeug- und Führerausweis anpassen',
        text: 'Die neue Adresse muss auch in Fahrzeug- und Führerausweis stehen. Zuständig ist das Strassenverkehrsamt.'
      }
    ]
  },
  {
    slug: 'firma',
    title: 'Ich gründe eine Firma',
    icon: 'firma',
    intro:
      'Für eine Firmengründung sind mehrere Stellen zuständig. Das Bundesportal EasyGov bündelt viele Schritte an einem Ort.',
    steps: [
      {
        title: 'Rechtsform wählen',
        text: 'Einzelunternehmen, GmbH oder AG: Die Rechtsform bestimmt Haftung, Mindestkapital und Besteuerung.'
      },
      {
        title: 'Handelsregister',
        text: 'GmbH und AG entstehen erst mit dem Eintrag ins Handelsregister. Einzelunternehmen müssen sich ab 100 000 Franken Jahresumsatz eintragen.',
        links: [{ label: 'EasyGov.swiss', href: 'https://www.easygov.swiss' }]
      },
      {
        title: 'Sozialversicherungen',
        text: 'Melden Sie sich bei einer AHV-Ausgleichskasse an. Wer Personal beschäftigt, braucht zudem eine obligatorische Unfallversicherung.'
      },
      {
        title: 'Mehrwertsteuer',
        text: 'Ab 100 000 Franken Jahresumsatz ist ein Unternehmen mehrwertsteuerpflichtig und meldet sich bei der Eidgenössischen Steuerverwaltung an.'
      }
    ]
  },
  {
    slug: 'kind',
    title: 'Ich bekomme ein Kind',
    icon: 'kind',
    intro: 'Rund um die Geburt gibt es einige Fristen. Die wichtigsten Schritte im Überblick.',
    steps: [
      {
        title: 'Geburt melden',
        text: 'Kommt Ihr Kind im Spital zur Welt, meldet das Spital die Geburt dem Zivilstandsamt.'
      },
      {
        title: 'Krankenkasse',
        text: 'Melden Sie Ihr Kind innert drei Monaten nach der Geburt bei einer Krankenkasse an. Dann ist es rückwirkend ab Geburt versichert.'
      },
      {
        title: 'Familienzulagen und Mutterschaft',
        text: 'Kinderzulagen beantragen Sie über Ihren Arbeitgeber oder Ihre Ausgleichskasse. Erwerbstätige Mütter erhalten während 14 Wochen eine Mutterschaftsentschädigung.'
      },
      {
        title: 'Ausweis für das Kind',
        text: 'Für Reisen braucht auch ein Kind eine eigene Identitätskarte oder einen Pass.',
        services: [38]
      }
    ]
  },
  {
    slug: 'hund',
    title: 'Ich nehme einen Hund auf',
    icon: 'hund',
    intro: 'Hunde werden mit Mikrochip registriert und bei der Gemeinde angemeldet.',
    steps: [
      {
        title: 'Mikrochip und AMICUS',
        text: 'Ihre Tierärztin oder Ihr Tierarzt erfasst den Hund mit der Mikrochip-Nummer in der nationalen Hundedatenbank AMICUS.'
      },
      {
        title: 'Als Hundehalter/-in registrieren',
        text: 'Halten Sie zum ersten Mal einen Hund, registrieren Sie sich zuerst als Ersthundehalter/-in.',
        services: [40]
      },
      {
        title: 'Hund anmelden',
        text: 'Melden Sie den Hund spätestens 10 Tage nach der Übernahme bei Ihrer Gemeinde an.',
        services: [45]
      },
      {
        title: 'Später: Hund abmelden',
        text: 'Bei Tod, Abgabe oder Wegzug melden Sie den Hund wieder ab.',
        services: [44]
      }
    ]
  },
  {
    slug: 'fuehrerausweis',
    title: 'Ich mache den Führerausweis',
    icon: 'auto',
    intro: 'Vom Lernfahrausweis bis zum eigenen Fahrzeug: die Schritte im Überblick.',
    steps: [
      {
        title: 'Lernfahrausweis',
        text: 'Für den Lernfahrausweis brauchen Sie einen Nothelferkurs, einen Sehtest und ein Gesuch beim Strassenverkehrsamt.'
      },
      {
        title: 'Theorieprüfung',
        text: 'Den Termin für die Theorieprüfung legen Sie online fest.',
        services: [33]
      },
      {
        title: 'Eigenes Fahrzeug',
        text: 'Wunschkontrollschilder ersteigern Sie online. Den Termin für die Fahrzeugprüfung können Sie online verschieben.',
        services: [34, 32]
      }
    ]
  },
  {
    slug: 'diebstahl',
    title: 'Mir wurde etwas gestohlen',
    icon: 'polizei',
    intro: 'Im Notfall rufen Sie die Polizei unter 117. Für alles andere gibt es Online-Anzeigen.',
    steps: [
      {
        title: 'Diebstahl anzeigen',
        text: 'Einen Diebstahl zeigen Sie online bei der Polizei an.',
        services: [27]
      },
      {
        title: 'Betrug im Internet',
        text: 'Phishing, Online-Betrug oder Erpressung melden Sie als Cyberkriminalität.',
        services: [30]
      },
      {
        title: 'Kontrollschild weg',
        text: 'Verlorene oder gestohlene Kontrollschilder melden Sie separat.',
        services: [29]
      },
      {
        title: 'Persönlich vorbeigehen',
        text: 'Lieber persönlich? Finden Sie den nächsten Polizeiposten.',
        services: [25]
      }
    ]
  }
]
