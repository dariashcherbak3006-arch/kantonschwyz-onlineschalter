'use client'

import { ExternalIcon } from './icons'
import { useT } from './i18n'

const SZ = 'https://onlineschalter.sz.ch'
const newTab = { target: '_blank', rel: 'noopener noreferrer' }

// Contact details from the Schalter imprint and the sz.ch footer
export default function Footer() {
  const { t } = useT()
  return (
    <>
    <aside className="help-card glass" aria-labelledby="help-card-title">
      <img src="/Maskottchen_Hallo.gif" alt="" width={520} height={520} />
      <div>
        <h2 id="help-card-title">{t('Brauchen Sie Hilfe?')}</h2>
        <p>{t('Fragen Sie unseren KI-Assistenten oder lesen Sie die häufigen Fragen.')}</p>
        <div className="help-card__links">
          <a href="/#ki" className="btn-primary">
            {t('KI-Assistent fragen')}
          </a>
          <a href="/faq" className="btn-link">
            FAQ
          </a>
        </div>
      </div>
    </aside>
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/logo.svg" alt="Kanton Schwyz" width={254} height={35} />
          <p>{t('Einfach. Schnell. Erledigt.')}</p>
        </div>

        <div>
          <h2>{t('Kontakt')}</h2>
          <address>
            {t('Zuständige Behörde')}:
            <br />
            Finanzdepartement des Kantons Schwyz
            <br />
            Departementssekretariat
            <br />
            Bahnhofstrasse 15, Postfach 1230
            <br />
            6431 Schwyz
          </address>
          <p>
            {t('Telefonzentrale Kanton Schwyz')}:
            <br />
            <a href="tel:+41418191124">+41 41 819 11 24</a>
            <br />
            <a href="mailto:info@sz.ch">info@sz.ch</a>
          </p>
        </div>

        <div>
          <h2>{t('Hilfe')}</h2>
          <ul>
            <li>
              <a href="/faq">FAQ</a>
            </li>
            <li>
              <a href={`${SZ}/ExternalServices/EgovHubServicePage/EgovHubServicePage.aspx?externalId=1004`} {...newTab}>
                {t('Support-Formular')}
                <ExternalIcon />
              </a>
            </li>
            <li>
              <a href={`${SZ}/ExternalServices/EgovHubServicePage/EgovHubServicePage.aspx?externalId=1007`} {...newTab}>
                {t('Feedback-Formular')}
                <ExternalIcon />
              </a>
            </li>
            <li>
              <a href={`${SZ}/de/Onlinehilfe.html`} {...newTab}>
                {t('Onlinehilfe')}
                <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t('Rechtliches')}</h2>
          <ul>
            <li>
              <a href={`${SZ}/de/Impressum.html`} {...newTab}>
                {t('Impressum')}
                <ExternalIcon />
              </a>
            </li>
            <li>
              <a href={`${SZ}/de/Nutzungs-und-Datenschutzbestimmungen/Nutzungs-und-Datenschutzbestimmungen.html`} {...newTab}>
                {t('Nutzungs- und Datenschutzbestimmungen')}
                <ExternalIcon />
              </a>
            </li>
            <li>
              <a href="/barrierefreiheit">{t('Barrierefreiheit')}</a>
            </li>
            <li>
              <a href="https://www.sz.ch/" {...newTab}>
                {t('Webseite Kanton Schwyz')}
                <ExternalIcon />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="site-footer__copy">© 2026 Kanton Schwyz</p>
    </footer>
    </>
  )
}
