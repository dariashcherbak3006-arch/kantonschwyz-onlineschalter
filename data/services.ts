// Single source for header menu, search, card/list views and the chat route.
// Page content + form/portal URLs live in details.json (extracted from onlineschalter.sz.ch),
// imported only server-side so it stays out of the client bundle.

export type Service = {
  id: number
  title: string
  desc: string
  href: string
  // true = the online service runs on an external portal, not on the Schalter
  external: boolean
  level?: Level
  // Municipalities offering it online; undefined = available everywhere (cantonal / external)
  gemeinden?: string[]
  // Short card labels condensed from the service page (Bearbeitungsdauer / Kosten)
  dauer?: string
  kosten?: string
}

export type Level = 'kommunal' | 'kantonal'

export const ALL_GEMEINDEN = [
  'Alpthal', 'Altendorf', 'Arth', 'Einsiedeln', 'Feusisberg', 'Freienbach', 'Galgenen', 'Gersau', 'Illgau',
  'Ingenbohl', 'Innerthal', 'Küssnacht', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Oberiberg', 'Reichenburg',
  'Riemenstalden', 'Rothenthurm', 'Sattel', 'Schübelbach', 'Schwyz', 'Steinen', 'Steinerberg', 'Tuggen',
  'Unteriberg', 'Vorderthal', 'Wangen', 'Wollerau'
]

// Participating municipalities per service, read from the live Schalter's Gemeinde selection (Oct 2026)
const GEMEINDE_LISTS: Record<number, string[]> = {
  39: ['Alpthal', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Ingenbohl', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Rothenthurm', 'Schwyz', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  40: ['Alpthal', 'Altendorf', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Innerthal', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Rothenthurm', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  41: ['Alpthal', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Reichenburg', 'Rothenthurm', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  43: ['Alpthal', 'Altendorf', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Ingenbohl', 'Lachen', 'Lauerz', 'Morschach', 'Rothenthurm', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  44: ['Altendorf', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Reichenburg', 'Rothenthurm', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  45: ['Alpthal', 'Altendorf', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Innerthal', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Reichenburg', 'Rothenthurm', 'Steinerberg', 'Vorderthal', 'Wollerau'],
  47: ['Alpthal', 'Altendorf', 'Arth', 'Feusisberg', 'Galgenen', 'Gersau', 'Ingenbohl', 'Innerthal', 'Lachen', 'Lauerz', 'Morschach', 'Muotathal', 'Reichenburg', 'Rothenthurm', 'Schwyz', 'Steinerberg', 'Vorderthal', 'Wangen', 'Wollerau']
}

// Responsibility per the canton's service list. External-portal services aren't classified there yet.
const LEVELS: Record<number, Level> = {
  40: 'kommunal', 45: 'kommunal', 44: 'kommunal', 41: 'kommunal', 39: 'kommunal', 47: 'kommunal', 43: 'kommunal',
  17: 'kantonal', 14: 'kantonal', 20: 'kantonal', 21: 'kantonal', 48: 'kantonal', 18: 'kantonal', 15: 'kantonal', 49: 'kantonal'
}

export type Section = { h: string; ordered: boolean; items: { text: string; href?: string }[][] }
export type Detail = { formUrl: string; sections: Section[] }

export type Topic = {
  title: string
  groups: { title: string; items: Service[] }[]
}

// Condensed from "Bearbeitungsdauer" and "Kosten" in details.json; full text stays on the detail page
const FACTS: Record<number, [dauer: string | null, kosten: string]> = {
  14: ['max. 5 Tage', 'Kostenlos'],
  15: ['max. 5 Tage', 'Kostenlos'],
  17: [null, 'Kostenlos'],
  18: ['Wenige Arbeitstage', 'ab CHF 75.–'],
  20: [null, 'Kostenlos'],
  21: ['max. 5 Arbeitstage', 'Verzugszinsen'],
  39: ['2–3 Arbeitstage', 'CHF 10.–'],
  40: ['2–3 Tage', 'Kostenlos'],
  41: ['2–3 Arbeitstage', 'CHF 20.–'],
  43: ['2–3 Arbeitstage', 'ab CHF 20.–'],
  44: ['2–3 Tage', 'Kostenlos'],
  45: ['2–3 Tage', 'Kostenlos'],
  47: ['2–3 Arbeitstage', 'ab CHF 10.–'],
  48: ['2–4 Wochen', 'Kostenlos'],
  49: ['max. 3 Tage', 'Kostenlos']
}

const s = (id: number, title: string, desc: string, external = false): Service => ({
  id,
  title,
  desc,
  href: `/dienstleistung/${id}`,
  external,
  level: LEVELS[id],
  gemeinden: GEMEINDE_LISTS[id],
  dauer: FACTS[id]?.[0] ?? undefined,
  kosten: FACTS[id]?.[1]
})

export const topics: Topic[] = [
  {
    title: 'Finanzen & Steuern',
    groups: [
      {
        title: 'Steuern',
        items: [
          s(17, 'Fristverlängerung für Steuererklärung beantragen', 'Mehr Zeit für das Einreichen der Steuererklärung.'),
          s(14, 'Direkte Bundessteuer: Ratenzahlung beantragen', 'Die Bundessteuer in Raten statt auf einmal bezahlen.'),
          s(15, 'Direkte Bundessteuer: Verlängerung der Zahlungsfrist beantragen', 'Die Zahlungsfrist der Bundessteuer verschieben.')
        ]
      },
      {
        title: 'Wehrpflichtersatzabgabe',
        items: [
          s(20, 'Rückerstattung beantragen', 'Bezahlte Wehrpflichtersatzabgabe zurückfordern.'),
          s(21, 'Ratenzahlung beantragen', 'Die Wehrpflichtersatzabgabe in Raten bezahlen.')
        ]
      },
      {
        title: 'Bussen',
        items: [s(35, 'Ordnungsbusse online bezahlen', 'Ordnungsbussen bequem online begleichen.', true)]
      },
      {
        title: 'Beiträge & Soziales',
        items: [
          s(48, 'Beitrag aus dem Lotteriefonds beantragen', 'Unterstützung für Projekte aus Kultur, Sport und Gesellschaft.'),
          s(41, 'Bestätigung zum Sozialhilfebezug bestellen', 'Offizielle Bestätigung über bezogene Sozialhilfe.')
        ]
      }
    ]
  },
  {
    title: 'Sicherheit & Recht',
    groups: [
      {
        title: 'Anzeigen',
        items: [
          s(30, 'Cyberkriminalität anzeigen', 'Betrug, Phishing oder Erpressung im Internet melden.', true),
          s(27, 'Diebstahl anzeigen', 'Einen Diebstahl online bei der Polizei anzeigen.', true),
          s(28, 'Sachbeschädigung anzeigen', 'Beschädigtes Eigentum online melden.', true)
        ]
      },
      {
        title: 'Polizei',
        items: [s(25, 'Polizeiposten suchen', 'Den nächsten Polizeiposten mit Öffnungszeiten finden.', true)]
      },
      {
        title: 'Waffen',
        items: [s(31, 'Waffenerwerb/-übertragung melden', 'Erwerb oder Weitergabe einer Waffe melden.', true)]
      },
      {
        title: 'Auszüge & Bewilligungen',
        items: [
          s(23, 'Strafregisterauszug bestellen', 'Privatauszug aus dem Strafregister bestellen.', true),
          s(49, 'Feuerbewilligung beantragen', 'Bewilligung für ein Feuer im Freien einholen.')
        ]
      }
    ]
  },
  {
    title: 'Strassenverkehr',
    groups: [
      {
        title: 'Fahrzeuge',
        items: [
          s(37, 'Fahrzeughalter abfragen', 'Halter eines Fahrzeugs anhand des Kontrollschilds ermitteln.', true),
          s(32, 'Fahrzeugprüfung verschieben', 'Einen Termin für die Fahrzeugprüfung verschieben.', true),
          s(34, 'Kontrollschilder ersteigern (Auto und Motorräder)', 'Wunschkontrollschilder online ersteigern.', true),
          s(29, 'Kontrollschildverlust anzeigen', 'Verlorene oder gestohlene Kontrollschilder melden.', true)
        ]
      },
      {
        title: 'Führerausweis',
        items: [s(33, 'Theorieprüfungstermin für den Führerausweis festlegen', 'Termin für die Theorieprüfung buchen.', true)]
      }
    ]
  },
  {
    title: 'Leben & Familie',
    groups: [
      {
        title: 'Wohnsitz & Umzug',
        items: [
          s(24, 'Umzug melden', 'Zu-, Weg- oder Umzug online der Gemeinde melden.', true),
          s(47, 'Wohnsitzbestätigung bestellen', 'Bestätigung über den aktuellen Wohnsitz bestellen.'),
          s(39, 'Adressauskunft bestellen', 'Die Adresse einer Person bei der Gemeinde erfragen.')
        ]
      },
      {
        title: 'Ausweise & Identität',
        items: [
          s(38, 'Identitätskarte / Schweizerpass bestellen', 'Termin für ID oder Pass vereinbaren.', true),
          s(43, 'Heimatausweis bestellen', 'Heimatausweis für den Wochenaufenthalt bestellen.')
        ]
      },
      {
        title: 'Haustiere',
        items: [
          s(45, 'Hund anmelden', 'Einen neuen Hund bei der Gemeinde anmelden.'),
          s(44, 'Hund abmelden', 'Einen Hund nach Tod oder Abgabe abmelden.'),
          s(40, 'Als Ersthundehalter/-in registrieren', 'Registrierung für Personen mit erstem Hund.')
        ]
      },
      {
        title: 'Militärdienst',
        items: [s(22, 'Militärdienst verwalten', 'Dienstverschiebung und Militärangelegenheiten online erledigen.', true)]
      },
      {
        title: 'Freizeit & Kultur',
        items: [
          s(36, 'Katalog der Kantonsbibliothek durchsuchen', 'Bücher und Medien der Kantonsbibliothek finden.', true),
          s(18, 'Sportbus beantragen', 'Den Sportbus für Vereine und Schulen reservieren.')
        ]
      }
    ]
  }
]

// Flat list with topic/group context, used by search and chat.
export const services = topics.flatMap((t) =>
  t.groups.flatMap((g) => g.items.map((item) => ({ ...item, topic: t.title, group: g.title })))
)

export type FlatService = (typeof services)[number]

export const norm = (str: string) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// Every word must appear in title, description, group or topic (also in their translation via t).
export function searchServices(query: string, t: (s: string) => string = (s) => s) {
  const words = norm(query).split(/\s+/).filter(Boolean)
  return services.filter((sv) => {
    const hay = norm(`${sv.title} ${sv.desc} ${sv.group} ${sv.topic} ${t(sv.group)} ${t(sv.topic)} ${t(sv.title)} ${t(sv.desc)}`)
    return words.every((w) => hay.includes(w))
  })
}
