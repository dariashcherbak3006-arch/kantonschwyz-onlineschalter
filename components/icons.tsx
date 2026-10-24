'use client'

import { useT } from './i18n'

const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': true } as const

export const ExternalIcon = () => {
  const { t } = useT()
  return (
  <>
    <svg {...base} className="icon icon--ext">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
    <span className="sr-only">{t('(externes Angebot)')}</span>
  </>
  )
}

export const SearchIcon = () => (
  <svg {...base} className="icon">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
)

export const SendIcon = () => (
  <svg {...base} className="icon">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const GridIcon = () => (
  <svg {...base} className="icon">
    <rect x="4" y="4" width="7" height="7" rx="1" />
    <rect x="13" y="4" width="7" height="7" rx="1" />
    <rect x="4" y="13" width="7" height="7" rx="1" />
    <rect x="13" y="13" width="7" height="7" rx="1" />
  </svg>
)

export const ListIcon = () => (
  <svg {...base} className="icon">
    <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
)

export const SparkIcon = () => (
  <svg {...base} className="icon">
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
  </svg>
)

export const UserIcon = () => (
  <svg {...base} className="icon">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

export const GlobeIcon = () => (
  <svg {...base} className="icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
)

// Piggy bank: path from Lucide (ISC license)
const PiggyIcon = () => (
  <svg {...base} className="icon">
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
    <path d="M16 11h.01" />
  </svg>
)

const ShieldIcon = () => (
  <svg {...base} className="icon">
    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const CarIcon = () => (
  <svg {...base} className="icon">
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
    <path d="M7.6 10l.7-2.5h7.4l.7 2.5z" />
    <rect x="3" y="11" width="18" height="6" rx="2" />
    <path d="M7 14h.01M17 14h.01M5.5 17v2.5h2.5V17M16 17v2.5h2.5V17" />
  </svg>
)

// Person with raised arms and a heart above, as in the design mockup
const FamilyIcon = () => (
  <svg {...base} className="icon">
    <path d="M12 7.2c-1.6-1.1-3-2.2-3-3.5 0-1.5 2-2 3-.7 1-1.3 3-.8 3 .7 0 1.3-1.4 2.4-3 3.5z" />
    <circle cx="12" cy="11" r="1.8" />
    <path d="M4 11.5c1.5 3 4.5 4.5 8 4.5s6.5-1.5 8-4.5M9 21v-5.3M15 21v-5.3" />
  </svg>
)

export const HelpIcon = () => (
  <svg {...base} className="icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
  </svg>
)

// Keyed by the German topic title from data/services.ts
export const topicIcons: Record<string, () => React.JSX.Element> = {
  'Finanzen & Steuern': PiggyIcon,
  'Sicherheit & Recht': ShieldIcon,
  Strassenverkehr: CarIcon,
  'Leben & Familie': FamilyIcon
}

// For server components, which can't index into a client module's exports
export const TopicIcon = ({ topic }: { topic: string }) => {
  const Icon = topicIcons[topic]
  return <Icon />
}

export const CheckIcon = () => (
  <svg {...base} className="icon">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

const BoxIcon = () => (
  <svg {...base} className="icon">
    <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
)

const BuildingIcon = () => (
  <svg {...base} className="icon">
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M3 21h18" />
    <path d="M8 8h3M8 12h3M8 16h3" />
  </svg>
)

const StrollerIcon = () => (
  <svg {...base} className="icon">
    <path d="M4 4h2l1.5 8h11a5 5 0 0 0-5-5V4" />
    <path d="M7.5 12a5.5 5.5 0 0 0 11 0" />
    <circle cx="9" cy="19" r="2" />
    <circle cx="17" cy="19" r="2" />
  </svg>
)

const PawIcon = () => (
  <svg {...base} className="icon">
    <circle cx="6" cy="10" r="1.8" />
    <circle cx="9.5" cy="5.5" r="1.8" />
    <circle cx="14.5" cy="5.5" r="1.8" />
    <circle cx="18" cy="10" r="1.8" />
    <path d="M12 11c-2.8 0-5.5 3.6-5.5 6.2C6.5 19 8 20 9.5 19.5c1-.3 1.7-.8 2.5-.8s1.5.5 2.5.8c1.5.5 3-.5 3-2.3 0-2.6-2.7-6.2-5.5-6.2z" />
  </svg>
)

// Icons for life situations (data/lebenslagen.ts)
const lifeIcons = {
  umzug: BoxIcon,
  firma: BuildingIcon,
  kind: StrollerIcon,
  hund: PawIcon,
  auto: CarIcon,
  polizei: ShieldIcon
}

export const LifeIcon = ({ icon }: { icon: keyof typeof lifeIcons }) => {
  const Icon = lifeIcons[icon]
  return <Icon />
}

export const ClockIcon = () => (
  <svg {...base} className="icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const CoinIcon = () => (
  <svg {...base} className="icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.5c-.4-1-1.4-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.2 0-2.2-.6-2.6-1.6M12 6.5V8M12 16v1.5" />
  </svg>
)
