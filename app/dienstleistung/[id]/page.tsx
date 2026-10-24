import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { services, type Section } from '@/data/services'
import { getDetail } from '@/data/details'
import { TranslatedNote, LevelBadge, T } from '@/components/i18n'
import { ExternalIcon, TopicIcon } from '@/components/icons'
import PageBot from '@/components/PageBot'
import { Availability } from '@/components/gemeinde'
import { FORMS } from '@/data/forms'

// Short facts go to the sidebar, the rest stays in the main text.
const FACTS = ['Anmeldung', 'Fristen', 'Bearbeitungsdauer', 'Kosten']
const CONTACT = 'Zuständige Stelle'
const SUPPORT_URL = 'https://onlineschalter.sz.ch/ExternalServices/EgovHubServicePage/EgovHubServicePage.aspx?externalId=1004'

const find = (id: string) => services.find((sv) => String(sv.id) === id)

export function generateStaticParams() {
  return services.map((sv) => ({ id: String(sv.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const sv = find((await params).id)
  return sv ? { title: `${sv.title} – Onlineschalter Kanton Schwyz`, description: sv.desc } : {}
}

const newTab = { target: '_blank', rel: 'noopener noreferrer' }

function Item({ segs }: { segs: Section['items'][number] }) {
  return segs.map((g, i) =>
    g.href ? (
      <a key={i} href={g.href} {...newTab}>
        <T>{g.text}</T>
        <ExternalIcon />
      </a>
    ) : (
      <span key={i}>
        <T>{g.text}</T>
      </span>
    )
  )
}

// Turns e-mail addresses and Swiss phone numbers in contact text into links.
function Linkify({ text }: { text: string }) {
  return text.split(/([\w.+-]+@[\w-]+\.[\w.-]*\w|\+41(?: ?\d){9})/).map((part, i) =>
    i % 2 === 0 ? (
      <T key={i}>{part}</T>
    ) : (
      <a key={i} href={part.includes('@') ? `mailto:${part}` : `tel:${part.replace(/ /g, '')}`}>
        {part}
      </a>
    )
  )
}

export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const sv = find((await params).id)
  const detail = sv && getDetail(sv.id)
  if (!sv || !detail) notFound()

  const main = detail.sections.filter((s) => !FACTS.includes(s.h) && s.h !== CONTACT)
  const facts = detail.sections.filter((s) => FACTS.includes(s.h))
  const contact = detail.sections.find((s) => s.h === CONTACT)
  const portal = new URL(detail.formUrl).hostname.replace(/^www\./, '')

  return (
    <>
      <article className="detail">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href="/">
            <T>Startseite</T>
          </a>
          <span aria-hidden="true">/</span>
          <span>
            <TopicIcon topic={sv.topic} />
            <T>{sv.topic}</T>
          </span>
          <span aria-hidden="true">/</span>
          <span>
            <T>{sv.group}</T>
          </span>
        </nav>

        <h1>
          <T>{sv.title}</T>
        </h1>
        <LevelBadge level={sv.level} />
        <p className="detail__lead">
          <T>{sv.desc}</T>
        </p>
        <TranslatedNote />

        <div className="detail__grid">
          <div className="detail__body">
            {sv.external && (
              <section>
                <p>
                  <T>Diese Dienstleistung wird über ein externes Portal angeboten:</T> <strong>{portal}</strong>
                </p>
              </section>
            )}
            {main.map((sec) => {
              const List = sec.ordered ? 'ol' : 'ul'
              return (
                <section key={sec.h}>
                  {sec.h && (
                    <h2>
                      <T>{sec.h}</T>
                    </h2>
                  )}
                  <List>
                    {sec.items.map((segs, i) => (
                      <li key={i}>
                        <Item segs={segs} />
                      </li>
                    ))}
                  </List>
                </section>
              )
            })}
          </div>

          <div className="detail__aside">
            <div className="aside-card glass">
              {/* Rebuilt forms live on this site; all others still go to the Schalter / external portal */}
              <a
                className="btn-primary"
                href={FORMS[sv.id] ? `${sv.href}/formular` : detail.formUrl}
                {...(sv.external ? newTab : {})}
              >
                <T>{sv.external ? 'Zum Online-Service' : 'Zum Formular'}</T>
                {sv.external && <ExternalIcon />}
              </a>
              {sv.gemeinden && <Availability gemeinden={sv.gemeinden} />}
              {!!facts.length && (
                <dl className="facts">
                  {facts.map((f) => (
                    <div key={f.h}>
                      <dt>
                        <T>{f.h}</T>
                      </dt>
                      {f.items.map((segs, i) => (
                        <dd key={i}>
                          <Item segs={segs} />
                        </dd>
                      ))}
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <div className="aside-card glass">
              <h2>
                <T>Kontakt</T>
              </h2>
              {contact ? (
                contact.items.map((segs, i) => (
                  <p key={i} className="contact">
                    <Linkify text={segs.map((g) => g.text).join('')} />
                  </p>
                ))
              ) : (
                <p className="contact">
                  <T>Fragen zum Angebot beantwortet der Betreiber des Portals:</T> {portal}
                </p>
              )}
              <p className="contact contact--muted">
                <T>Fragen zum Onlineschalter?</T>{' '}
                <a href={SUPPORT_URL} {...newTab}>
                  <T>Support-Formular</T>
                  <ExternalIcon />
                </a>
              </p>
            </div>
          </div>
        </div>
      </article>
      <PageBot serviceId={sv.id} />
    </>
  )
}
