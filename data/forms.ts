// Step-by-step forms converted from the live Schalter (scripts/convert-forms.py -> data/forms/<serviceId>.json).
// Municipal services get a Gemeinde step in front, limited to the municipalities offering them online.
import { services } from './services'
import f14 from './forms/14.json'
import f15 from './forms/15.json'
import f17 from './forms/17.json'
import f18 from './forms/18.json'
import f39 from './forms/39.json'
import f40 from './forms/40.json'
import f41 from './forms/41.json'
import f43 from './forms/43.json'
import f44 from './forms/44.json'
import f45 from './forms/45.json'
import f47 from './forms/47.json'
import f48 from './forms/48.json'

// Show/hide or require a field (or step) depending on another field's value, applied in order
export type Rule = { attr: 'hide' | 'required'; value: boolean; op: '=' | '!='; field: string; eq: string }

export type Field = {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file' | 'info'
  required?: boolean
  hidden?: boolean
  rules?: Rule[]
  options?: string[]
  default?: string
  hint?: string
  // sanitized HTML for info boxes
  html?: string
  pattern?: string
  patternMessage?: string
  inputMode?: 'numeric' | 'tel' | 'email'
  placeholder?: string
  // width on a 12-column grid, default full width
  span?: number
  // date limits: 'today', 'today+90', 'adult' (at least 18 years ago)
  min?: string
  max?: string
  minValue?: number
  maxValue?: number
  multiple?: boolean
  accept?: string
  readonly?: boolean
  compute?: { year?: number; dateDiff?: [string, string]; plus?: number }
  // HTML autocomplete token (WCAG 1.3.5), only on fields about the applicant
  autocomplete?: string
}

// title = label under the progress dot, intro = heading on the step, note = HTML under the heading
export type Step = { title: string; intro?: string; note?: string; rules?: Rule[]; fields: Field[] }

type Converted = { title: string | null; steps: Step[] }

const CONVERTED = {
  14: f14, 15: f15, 17: f17, 18: f18, 39: f39, 40: f40, 41: f41, 43: f43, 44: f44, 45: f45, 47: f47, 48: f48
} as unknown as Record<number, Converted>

const gemeindeStep = (options: string[]): Step => ({
  title: 'Gemeinde',
  fields: [
    {
      name: 'gemeinde',
      label: 'Auswahl der Gemeinde',
      type: 'select',
      required: true,
      options,
      hint: 'Bitte wählen Sie die Gemeinde aus, die Ihre Anfrage bearbeiten wird.'
    }
  ]
})

// Autofill only where the applicant enters their own data; other steps (deviating sender,
// the person looked up, delivery address, driver, the dog's "Name") stay off.
const OWN_STEP = /^(Personalien|Antragstellende Person|Mieterin \/ Mieter|Angaben zum Hauptwohnsitz)/
const AUTOCOMPLETE: Record<string, string> = {
  Anrede: 'honorific-prefix',
  Vorname: 'given-name',
  Name: 'family-name',
  Firma: 'organization',
  Geburtsdatum: 'bday',
  Geburtstag: 'bday',
  Adresse: 'address-line1',
  Strasse: 'address-line1',
  'Strasse / Nr.': 'address-line1',
  PLZ: 'postal-code',
  Postleitzahl: 'postal-code',
  Ort: 'address-level2',
  Land: 'country-name',
  'E-Mail': 'email',
  Telefon: 'tel-national',
  Vorwahl: 'tel-country-code'
}

const withAutocomplete = (s: Step): Step =>
  OWN_STEP.test(s.title) ? { ...s, fields: s.fields.map((f) => ({ ...f, autocomplete: AUTOCOMPLETE[f.label] })) } : s

export const FORMS: Record<number, { title: string; steps: Step[] }> = Object.fromEntries(
  Object.entries(CONVERTED).map(([id, form]) => {
    const sv = services.find((s) => s.id === Number(id))!
    const own = form.steps.map(withAutocomplete)
    const steps = sv.gemeinden ? [gemeindeStep(sv.gemeinden), ...own] : own
    return [id, { title: sv.title, steps }]
  })
)
