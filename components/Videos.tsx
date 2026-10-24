'use client'

import { useT } from './i18n'

// Explainer videos from https://onlineschalter.sz.ch/de/Onlinehilfe.html.
// ponytail: Vimeo's own player handles playback and fullscreen; own player only if Vimeo gets dropped.
const VIDEOS = [
  { id: 1214294253, title: 'Der Onlineschalter – einfach kurz erklärt' },
  { id: 1214294254, title: 'Wie erstelle ich ein persönliches Konto?' },
  { id: 1214294252, title: 'Wie gut sind meine Daten geschützt?' }
]

export default function Videos() {
  const { t } = useT()
  return (
    <ul className="videos">
      {VIDEOS.map((v) => (
        <li key={v.id} className="video glass">
          <iframe
            src={`https://player.vimeo.com/video/${v.id}?dnt=1&badge=0&title=0&byline=0&portrait=0`}
            title={t(v.title)}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <p>{t(v.title)}</p>
        </li>
      ))}
    </ul>
  )
}
