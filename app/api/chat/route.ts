import { services, norm, type FlatService } from '@/data/services'
import { getDetail } from '@/data/details'

type Msg = { role: 'user' | 'assistant'; content: string }

const toLink = ({ title, href, external }: FlatService) => ({ title, href, external })

const LANG_NAMES = { de: 'Deutsch', it: 'Italienisch', fr: 'Französisch', en: 'Englisch' }

const system = (lang: string) => `Du bist der digitale Assistent des Onlineschalters des Kantons Schwyz.
Antworte kurz, freundlich und auf ${lang}. Hilf Personen, die passende Dienstleistung zu finden.
Erfinde keine Links oder Dienstleistungen. Verfügbare Dienstleistungen (JSON):
${JSON.stringify(services.map(({ id, title, desc, topic, group, level }) => ({ id, title, desc, topic, group, level })))}
Antworte ausschliesslich als JSON: {"reply": "<Antwort>", "linkIds": [<ids passender Dienstleistungen, max. 3>]}`

// Page bot: same JSON contract, but grounded in one service page.
const pageSystem = (lang: string, sv: FlatService) => {
  const detail = getDetail(sv.id)!
  const text = detail.sections
    .map((s) => `## ${s.h}\n${s.items.map((it) => '- ' + it.map((g) => g.text).join('')).join('\n')}`)
    .join('\n')
  return `Du bist der digitale Assistent des Onlineschalters des Kantons Schwyz.
Beantworte Fragen zur Dienstleistung «${sv.title}» kurz, freundlich und auf ${lang}.
Stütze dich nur auf den Seiteninhalt unten. Steht die Antwort nicht darin, sag das offen und verweise auf die zuständige Stelle.
Seiteninhalt:
${sv.desc}
${sv.external ? `Online-Service auf externem Portal: ${detail.formUrl}` : ''}
${text}
Antworte ausschliesslich als JSON: {"reply": "<Antwort>", "linkIds": []}`
}

export async function POST(req: Request) {
  const { messages, lang, serviceId } = (await req.json()) as { messages: Msg[]; lang?: string; serviceId?: number }
  if (!Array.isArray(messages) || !messages.length) {
    return Response.json({ error: 'messages required' }, { status: 400 })
  }
  // ponytail: last 10 turns only, keeps prompt cheap; raise if conversations need longer memory.
  const history = messages.slice(-10).map(({ role, content }) => ({
    role: role === 'assistant' ? 'assistant' : 'user',
    content: String(content).slice(0, 2000)
  }))

  const page = serviceId === undefined ? undefined : services.find((sv) => sv.id === serviceId)
  if (serviceId !== undefined && !page) return Response.json({ error: 'unknown serviceId' }, { status: 400 })
  const langName = LANG_NAMES[lang as keyof typeof LANG_NAMES] ?? 'Deutsch'

  if (!process.env.OPENROUTER_API_KEY) {
    const question = history.at(-1)!.content
    return Response.json(page ? pageStub(page, question) : stub(question))
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL,
      messages: [{ role: 'system', content: page ? pageSystem(langName, page) : system(langName) }, ...history],
      response_format: { type: 'json_object' }
    })
  })
  if (!res.ok) return Response.json({ error: 'Assistent nicht erreichbar.' }, { status: 502 })

  const data = await res.json()
  try {
    const { reply, linkIds } = JSON.parse(data.choices[0].message.content)
    const links = services.filter((sv) => (linkIds ?? []).includes(sv.id)).map(toLink)
    return Response.json({ reply: String(reply), links })
  } catch {
    return Response.json({ reply: String(data.choices?.[0]?.message?.content ?? ''), links: [] })
  }
}

// Dev fallback without API key: keyword match over the service list.
function stub(question: string) {
  const words = norm(question).split(/\W+/).filter((w) => w.length > 3)
  const scored = services.map((sv) => ({
    sv,
    score: words.filter((w) => norm(`${sv.title} ${sv.desc} ${sv.group}`).includes(w)).length
  }))
  const best = Math.max(...scored.map((r) => r.score))
  const links = best ? scored.filter((r) => r.score === best).slice(0, 3).map((r) => toLink(r.sv)) : []
  const reply = links.length
    ? 'Diese Dienstleistungen könnten Ihnen weiterhelfen:'
    : 'Dazu habe ich leider nichts gefunden. Versuchen Sie es mit anderen Worten oder wählen Sie ein Thema.'
  return { reply, links }
}

// Dev fallback for the page bot: answers with the matching section of the page.
const PAGE_TOPICS: [RegExp, string][] = [
  [/kost|preis|gebuhr|cout|cost/, 'Kosten'],
  [/unterlag|dokument|document/, 'Benötigte Unterlagen'],
  [/dauer|lange|wann|temps|tempo|long/, 'Bearbeitungsdauer'],
  [/frist|delai|termin|deadline/, 'Fristen'],
  [/login|konto|anmeld|account|connexion/, 'Anmeldung'],
  [/\bwer\b|zustandig|kontakt|contact|contatt/, 'Zuständige Stelle'],
  [/ablauf|wie |schritt|procedure|procedura/, 'Ablauf']
]

function pageStub(sv: FlatService, question: string) {
  const sections = getDetail(sv.id)!.sections
  const h = PAGE_TOPICS.find(([re]) => re.test(norm(question)))?.[1] ?? 'Kurzbeschrieb'
  const sec = sections.find((s) => s.h === h)
  const reply = sec
    ? `${h}:\n${sec.items.map((it) => '• ' + it.map((g) => g.text).join('')).join('\n')}`
    : `Dazu steht auf dieser Seite nichts. ${sv.desc} Für Details wenden Sie sich an die zuständige Stelle.`
  return { reply, links: [] }
}
