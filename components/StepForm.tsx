'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Field, Rule, Step } from '@/data/forms'
import { ExternalIcon } from './icons'
import { useGemeinde } from './gemeinde'
import { useT } from './i18n'

type Values = Record<string, string>

const iso = (d: Date) => d.toISOString().slice(0, 10)
// 2026-10-01 -> 01.10.2026 for the summary
const swissDate = (v: string) => v.split('-').reverse().join('.')

// 'today' | 'today+90' | 'adult' -> yyyy-mm-dd
function dateLimit(token?: string) {
  if (!token) return undefined
  const d = new Date()
  if (token === 'adult') d.setFullYear(d.getFullYear() - 18)
  const plus = token.match(/^today\+(\d+)$/)
  if (plus) d.setDate(d.getDate() + Number(plus[1]))
  return iso(d)
}

// Rules flip a field's/step's defaults when their condition matches (compared case-insensitively)
function applyRules(rules: Rule[] | undefined, values: Values, start: { hidden: boolean; required: boolean }) {
  const out = { ...start }
  for (const r of rules ?? []) {
    const cur = (values[r.field] ?? '').trim().toLowerCase()
    const hit = r.op === '=' ? cur === r.eq.trim().toLowerCase() : cur !== r.eq.trim().toLowerCase()
    if (hit) r.attr === 'hide' ? (out.hidden = r.value) : (out.required = r.value)
  }
  return out
}

const fieldState = (f: Field, v: Values) => applyRules(f.rules, v, { hidden: !!f.hidden, required: !!f.required })
const stepVisible = (s: Step, v: Values) => !applyRules(s.rules, v, { hidden: false, required: false }).hidden

function computed(f: Field, v: Values) {
  const c = f.compute!
  if (c.year !== undefined) return String(new Date().getFullYear() + c.year)
  if (c.dateDiff) {
    const [a, b] = c.dateDiff.map((n) => v[n])
    if (!a || !b) return ''
    return String(Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + (c.plus ?? 0))
  }
  return ''
}

// Wizard: one step per screen, validation on "Weiter", answers kept in memory only (never stored).
export default function StepForm({ steps, officialUrl }: { steps: Step[]; officialUrl: string }) {
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(steps.flatMap((s) => s.fields).filter((f) => f.default).map((f) => [f.name, f.default!]))
  )
  const [current, setCurrent] = useState(0)
  const [sent, setSent] = useState(false)
  const top = useRef<HTMLDivElement>(null)
  const [myGemeinde, setMyGemeinde] = useGemeinde()
  const { t } = useT()

  // Preselect "Meine Gemeinde" when this service is offered there
  const gemeindeOptions = steps.flatMap((s) => s.fields).find((f) => f.name === 'gemeinde')?.options ?? []
  useEffect(() => {
    if (myGemeinde && gemeindeOptions.includes(myGemeinde)) setValues((v) => (v.gemeinde ? v : { ...v, gemeinde: myGemeinde }))
  }, [myGemeinde]) // eslint-disable-line react-hooks/exhaustive-deps

  // Steps hidden by rules (e.g. "Absender (abweichend)") drop out of navigation and progress
  const visible = steps.filter((s) => stepVisible(s, values))
  const reviewIndex = visible.length
  const step = visible[Math.min(current, visible.length - 1)]

  // Each segment between two dots fills with its step's visible required fields, so the line
  // reaches the next dot exactly when a step is complete.
  const segments = visible.map((s) => {
    const req = s.fields.filter((f) => f.type !== 'info' && !f.compute && fieldState(f, values).required && !fieldState(f, values).hidden)
    return req.length ? req.filter((f) => values[f.name]?.trim()).length / req.length : current > visible.indexOf(s) ? 1 : 0
  })
  const progress = sent ? 1 : segments.reduce((a, b) => a + b, 0) / Math.max(visible.length, 1)

  const go = (i: number) => {
    setCurrent(i)
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function next(e: FormEvent) {
    e.preventDefault()
    go(current + 1)
  }

  const set = (name: string, v: string) => {
    setValues((old) => ({ ...old, [name]: v }))
    if (name === 'gemeinde' && v) setMyGemeinde(v)
  }
  const labels = [...visible.map((s) => s.title), 'Zusammenfassung']
  const display = (f: Field) => {
    const v = f.compute ? computed(f, values) : values[f.name]?.trim()
    // Values stay German (rules compare them); only what is shown gets translated
    return !v ? '–' : f.type === 'date' ? swissDate(v) : t(v)
  }

  return (
    <div className="wizard" ref={top}>
      <p className="wizard__notice">{t('Vorschau des neuen Onlineschalters: Dieses Formular übermittelt noch keine Daten.')}</p>

      <div className="steps">
        <div
          className="steps__track"
          role="progressbar"
          aria-label={t('Fortschritt')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="steps__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <ol className="steps__list">
          {labels.map((label, i) => {
            // Dot fills when the line reaches it, so dots and line always agree
            const reached = sent || progress >= i / visible.length - 1e-9
            const state = i === current && !sent ? 'current' : reached ? 'done' : 'todo'
            return (
              <li key={label + i} className={`steps__item steps__item--${state}`}>
                <button
                  type="button"
                  className="steps__dot"
                  disabled={sent || i >= current}
                  aria-current={i === current ? 'step' : undefined}
                  aria-label={`${t('Schritt')} ${i + 1}: ${t(label)}`}
                  onClick={() => go(i)}
                />
                <span className="steps__label">{t(label)}</span>
              </li>
            )
          })}
        </ol>
        <p className="steps__pct">{Math.round(progress * 100)} % {t('ausgefüllt')}</p>
      </div>

      {sent ? (
        <div className="wizard__card glass wizard__done">
          <h2>{t('Ihre Angaben wurden nicht übermittelt')}</h2>
          <p>
            {t(
              'Dies ist eine Vorschau des neuen Onlineschalters. Es wurden keine Daten gesendet oder gespeichert. Für eine verbindliche Meldung nutzen Sie bitte das offizielle Formular.'
            )}
          </p>
          <a className="btn-primary" href={officialUrl} target="_blank" rel="noopener noreferrer">
            {t('Zum offiziellen Formular')}
            <ExternalIcon />
          </a>
        </div>
      ) : current >= reviewIndex ? (
        <div className="wizard__card glass">
          <h2>{t('Zusammenfassung')}</h2>
          <p className="wizard__lead">{t('Bitte prüfen Sie Ihre Angaben vor dem Absenden.')}</p>
          {visible.map((s, i) => (
            <section key={s.title + i} className="review">
              <div className="review__head">
                <h3>{t(s.intro ?? s.title)}</h3>
                <button type="button" className="link-btn" onClick={() => go(i)}>
                  {t('Bearbeiten')}
                </button>
              </div>
              <dl>
                {s.fields
                  .filter((f) => f.type !== 'info' && !fieldState(f, values).hidden)
                  .map((f) => (
                    <div key={f.name}>
                      <dt>{t(f.label)}</dt>
                      <dd>{display(f)}</dd>
                    </div>
                  ))}
              </dl>
            </section>
          ))}
          <div className="wizard__nav">
            <button type="button" className="btn-secondary" onClick={() => go(current - 1)}>
              {t('Zurück')}
            </button>
            <button type="button" className="btn-primary" onClick={() => setSent(true)}>
              {t('Absenden')}
            </button>
          </div>
        </div>
      ) : (
        <form className="wizard__card glass" onSubmit={next}>
          <h2>{t(step.intro ?? step.title)}</h2>
          {/* note is sanitized HTML from scripts/convert-forms.py (links, lists, bold only) */}
          {step.note && <div className="wizard__lead wizard__note" dangerouslySetInnerHTML={{ __html: t(step.note) }} />}
          <div className="fields">
            {step.fields.map((f) => {
              const st = fieldState(f, values)
              if (st.hidden) return null
              return (
                <FieldInput
                  key={f.name}
                  field={f}
                  required={st.required}
                  value={f.compute ? computed(f, values) : (values[f.name] ?? '')}
                  onChange={(v) => set(f.name, v)}
                />
              )
            })}
          </div>
          <div className="wizard__nav">
            {current > 0 && (
              <button type="button" className="btn-secondary" onClick={() => go(current - 1)}>
                {t('Zurück')}
              </button>
            )}
            <button type="submit" className="btn-primary">
              {t('Weiter')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function FieldInput({
  field: f,
  value,
  required,
  onChange
}: {
  field: Field
  value: string
  required: boolean
  onChange: (v: string) => void
}) {
  const id = `f-${f.name}`
  const hintId = f.hint ? `${id}-hint` : undefined
  const ref = useRef<HTMLInputElement>(null)
  const { t } = useT()

  // Patterns are checked here (not via the pattern attribute) so the canton's own error message shows
  useEffect(() => {
    if (!ref.current || !f.pattern) return
    let ok = true
    try {
      ok = !value || new RegExp(f.pattern, 'u').test(value)
    } catch {}
    ref.current.setCustomValidity(ok ? '' : t(f.patternMessage ?? 'Ungültige Eingabe'))
  }, [value, f.pattern, f.patternMessage, t])

  const label = (
    <>
      {t(f.label)}
      {required && <span aria-hidden="true"> *</span>}
    </>
  )
  const hint = f.hint && (
    <p id={hintId} className="field__hint">
      {t(f.hint)}
    </p>
  )
  const style = { gridColumn: `span ${f.span ?? 12}` }

  if (f.type === 'info') {
    return (
      <div className="field field--info" style={style}>
        <p className="field__info-title">{t(f.label)}</p>
        {f.html && <div dangerouslySetInnerHTML={{ __html: t(f.html) }} />}
      </div>
    )
  }

  if (f.type === 'radio') {
    return (
      <fieldset className="field" style={style} aria-describedby={hintId}>
        <legend>{label}</legend>
        {f.options!.map((o) => (
          <label key={o} className="radio">
            <input type="radio" name={f.name} value={o} checked={value === o} required={required} onChange={() => onChange(o)} />
            {t(o)}
          </label>
        ))}
        {hint}
      </fieldset>
    )
  }

  if (f.type === 'checkbox') {
    return (
      <div className="field" style={style}>
        <label className="radio">
          <input type="checkbox" checked={value === 'Ja'} required={required} onChange={(e) => onChange(e.target.checked ? 'Ja' : '')} />
          {label}
        </label>
        {hint}
      </div>
    )
  }

  const common = {
    id,
    required,
    'aria-describedby': hintId,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value)
  }

  return (
    <div className="field" style={style}>
      <label htmlFor={id}>{label}</label>
      {f.type === 'select' ? (
        <select {...common} value={value}>
          <option value="">{t('Bitte wählen')}</option>
          {f.options!.map((o) => (
            <option key={o} value={o}>
              {t(o)}
            </option>
          ))}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea {...common} value={value} rows={4} />
      ) : f.type === 'file' ? (
        <>
          {/* File inputs can't be prefilled: once chosen, the name counts as answered */}
          <input
            id={id}
            type="file"
            multiple={f.multiple}
            accept={f.accept}
            required={required && !value}
            aria-describedby={hintId}
            onChange={(e) => onChange([...(e.target.files ?? [])].map((x) => x.name).join(', '))}
          />
          {value && <p className="field__hint">{t('Ausgewählt:')} {value}</p>}
        </>
      ) : (
        <input
          {...common}
          ref={ref}
          value={value}
          type={f.type}
          inputMode={f.inputMode}
          placeholder={f.placeholder && t(f.placeholder)}
          readOnly={f.readonly}
          min={f.type === 'date' ? dateLimit(f.min) : f.minValue}
          max={f.type === 'date' ? dateLimit(f.max) : f.maxValue}
          autoComplete="off"
        />
      )}
      {hint}
    </div>
  )
}
