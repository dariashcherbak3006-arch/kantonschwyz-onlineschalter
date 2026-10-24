import type { Metadata } from 'next'
import Header from '@/components/Header'
import { LangProvider } from '@/components/i18n'
import ToTop from '@/components/ToTop'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Onlineschalter Kanton Schwyz',
  description: 'Alle Online-Dienstleistungen des Kantons Schwyz an einem Ort.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <LangProvider>
          <a href="#main" className="skip-link">
            Zum Inhalt springen
          </a>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <ToTop />
        </LangProvider>
      </body>
    </html>
  )
}
