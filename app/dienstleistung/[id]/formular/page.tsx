import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { services } from '@/data/services'
import { getDetail } from '@/data/details'
import { FORMS } from '@/data/forms'
import { DeOnlyNote, T } from '@/components/i18n'
import StepForm from '@/components/StepForm'

export function generateStaticParams() {
  return Object.keys(FORMS).map((id) => ({ id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const form = FORMS[Number((await params).id)]
  return form ? { title: `${form.title} – Formular – Onlineschalter Kanton Schwyz` } : {}
}

export default async function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  const form = FORMS[id]
  const sv = services.find((s) => s.id === id)
  if (!form || !sv) notFound()

  return (
    <article className="detail detail--form">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="/">
          <T>Startseite</T>
        </a>
        <span aria-hidden="true">/</span>
        <a href={sv.href}>{sv.title}</a>
        <span aria-hidden="true">/</span>
        <span>
          <T>Formular</T>
        </span>
      </nav>
      <h1>{form.title}</h1>
      <DeOnlyNote />
      <StepForm steps={form.steps} officialUrl={getDetail(id)!.formUrl} />
    </article>
  )
}
