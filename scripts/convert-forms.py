"""Convert the live Schalter form definitions into data/forms/<serviceId>.json for components/StepForm.

Two sources, both captured from onlineschalter.sz.ch with a headless browser (Oct 2026; raw files not in the repo):
  - cantonal forms: formly JSON schema embedded in the page (<script id="egh-data-form-accelerator">),
    saved as <id>-egh.json / <id>-collect.json
  - municipal forms: CumulusPro FormDefinition JSON loaded by the form app after choosing a Gemeinde,
    saved as <id>-spa.json (list of {url, body} GET responses)

Usage: python3 scripts/convert-forms.py <capture-dir>
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

RAW = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / 'data' / 'forms'

# capture file id -> service id on this site
CANTONAL = {'1001': 17, '1117': 14, '1005': 15, '1014': 18, '1013': 48}
MUNICIPAL = {'5007': 45, '5006': 44, '5002': 40, '5003': 41, '5005': 43, '5009': 47, '5001': 39}

PHONE_PREFIXES = ['+41', '+423', '+49', '+43', '+39', '+33']
NAME_PATTERN_MSG = 'Bitte verwenden Sie keine Zahlen oder Sonderzeichen'


# ---------- HTML: keep a small safe subset ----------

class Sanitizer(HTMLParser):
    KEEP = {'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []

    def handle_starttag(self, tag, attrs):
        if tag not in self.KEEP:
            return
        if tag == 'a':
            href = dict(attrs).get('href') or ''
            if not href.startswith(('https://', 'http://')):
                return
            self.out.append(f'<a href="{html.escape(href)}" target="_blank" rel="noopener noreferrer">')
        else:
            self.out.append(f'<{tag}>')

    def handle_endtag(self, tag):
        if tag in self.KEEP and tag != 'br':
            self.out.append(f'</{tag}>')

    def handle_data(self, data):
        self.out.append(html.escape(data.replace('\xa0', ' ')))


def clean_html(s):
    if not s:
        return None
    p = Sanitizer()
    p.feed(s)
    out = ''.join(p.out)
    out = re.sub(r'<(p|li)>\s*</\1>', '', out)
    out = re.sub(r'\s+', ' ', out).strip()
    # drop anchors whose start tag was filtered out
    if out.count('<a ') < out.count('</a>'):
        out = out.replace('</a>', '', out.count('</a>') - out.count('<a '))
    return out or None


def text_only(s):
    if not s:
        return None
    t = re.sub(r'<[^>]+>', ' ', s.replace('&nbsp;', ' '))
    t = re.sub(r'\s+', ' ', html.unescape(t)).strip()
    return t or None


def split_heading(desc):
    """'<h3>Title</h3><p>rest</p>' -> ('Title', '<p>rest</p>')"""
    m = re.search(r'<h[1-4][^>]*>(.*?)</h[1-4]>', desc or '', re.S)
    if not m:
        return None, desc
    return text_only(m.group(1)), (desc[:m.start()] + desc[m.end():])


# ---------- shared field builders ----------

def address(base, label, required, rules=None):
    countries = COUNTRIES or ['Schweiz']
    return [
        dict(name=f'{base}_strasse', label=f'{label}: Strasse' if label != 'Adresse' else 'Strasse', type='text', required=required, span=9, rules=rules),
        dict(name=f'{base}_nr', label='Nr.', type='text', required=required, span=3, rules=rules),
        dict(name=f'{base}_plz', label='PLZ', type='text', required=required, span=4, pattern=r'^[0-9]{4,5}$',
             patternMessage='Bitte geben Sie eine gültige Postleitzahl ein.', inputMode='numeric', rules=rules),
        dict(name=f'{base}_ort', label='Ort', type='text', required=required, span=8, rules=rules),
        dict(name=f'{base}_land', label='Land', type='select', required=required, options=countries, default='Schweiz', rules=rules),
    ]


def phone(base, label, required, rules=None):
    return [
        dict(name=f'{base}_vorwahl', label='Vorwahl', type='select', required=required, span=3, options=PHONE_PREFIXES, default='+41', rules=rules),
        dict(name=base, label=label, type='tel', required=required, span=9, inputMode='tel', pattern=r'^[0-9 ]{6,15}$',
             patternMessage='Bitte geben Sie eine gültige Telefonnummer ein.', rules=rules),
    ]


def strip_none(d):
    return {k: v for k, v in d.items() if v not in (None, [], False)}


# ---------- formly (cantonal) ----------

def formly_date_limit(v):
    if not v:
        return None
    m = re.match(r'\{\$today\}\s*(?:\+\s*(\d+))?', str(v))
    return f'today+{m.group(1)}' if m and m.group(1) else 'today' if m else None


def formly_rule(expr, names):
    """{"field": "stepper.page.key", "operator": "equals"|"notEquals", "value": "ja"} -> hide rule"""
    field = names.get(expr['field'].removeprefix('stepper.'), expr['field'])
    op = '=' if expr['operator'] == 'equals' else '!='
    return dict(attr='hide', value=True, op=op, field=field, eq=str(expr['value']))


def formly_fields(page_key, node, names):
    required = set(node.get('required') or [])
    fields = []
    for key, f in (node.get('properties') or {}).items():
        fc = (f.get('widget') or {}).get('formlyConfig') or {}
        props = fc.get('props') or {}
        exprs = fc.get('expressions') or {}
        name = f'{page_key}.{key}' if page_key else key
        names[name] = name
        t = f.get('type')
        req = key in required or bool(props.get('required'))
        label = f.get('title') or props.get('label') or key
        hint = text_only(f.get('description') or props.get('description'))
        base = dict(name=name, label=label, required=req, hint=hint, placeholder=props.get('placeholder'))
        opts = props.get('options')
        options = [o['label'] for o in opts] if isinstance(opts, list) else None

        if t is None:  # helper value, e.g. day difference used by another field
            continue
        if 'defaultValue' in exprs and props.get('readonly'):
            dv = exprs['defaultValue']
            if 'math' in dv and '$currentYear' in dv['math']:
                fields.append(strip_none({**base, 'type': 'text', 'readonly': True, 'compute': {'year': -1}, 'required': False}))
            elif 'math' in dv and 'anzahl_tage_brut' in dv['math']:
                fields.append(strip_none({**base, 'type': 'text', 'readonly': True, 'required': False,
                                          'compute': {'dateDiff': [f'{page_key}.mietdauer_von', f'{page_key}.mietdauer_bis'], 'plus': 1}}))
            continue
        if t == 'string' and props.get('pattern'):
            fields.append(strip_none({**base, 'type': 'text', 'pattern': f"^(?:{props['pattern']})$", 'inputMode': 'numeric',
                                      'patternMessage': 'Bitte nur Ziffern eingeben.'}))
        elif t == 'string':
            fields.append(strip_none({**base, 'type': 'text', 'span': 4 if f.get('class') == 'quarter' else None}))
        elif t == 'textarea':
            fields.append(strip_none({**base, 'type': 'textarea'}))
        elif t == 'number':
            fields.append(strip_none({**base, 'type': 'number', 'minValue': props.get('min'), 'maxValue': props.get('max')}))
        elif t == 'masked-input':
            digits = len(props.get('mask', '0000'))
            fields.append(strip_none({**base, 'type': 'text', 'pattern': f'^[0-9]{{{digits}}}$', 'inputMode': 'numeric',
                                      'patternMessage': f'Bitte {digits} Ziffern eingeben.', 'span': 4}))
        elif t in ('select', 'radio'):
            fields.append(strip_none({**base, 'type': t, 'options': options or COUNTRIES,
                                      'default': 'Schweiz' if key == 'land' else None}))
        elif t == 'checkbox':
            fields.append(strip_none({**base, 'type': 'checkbox'}))
        elif t == 'date-picker':
            fields.append(strip_none({**base, 'type': 'date', 'min': formly_date_limit(props.get('minDate')),
                                      'max': formly_date_limit(props.get('maxDate')), 'placeholder': None}))
        elif t == '#email':
            fields.append(strip_none({**base, 'type': 'email', 'inputMode': 'email'}))
        elif t == '#phone':
            fields.append(strip_none({**base, 'type': 'tel', 'inputMode': 'tel', 'placeholder': '+41 …',
                                      'pattern': r'^\+?[0-9 ]{6,18}$', 'patternMessage': 'Bitte geben Sie eine gültige Telefonnummer ein.'}))
        elif t == '#iban':
            fields.append(strip_none({**base, 'type': 'text', 'placeholder': 'CH00 0000 0000 0000 0000 0',
                                      'pattern': r'^[A-Za-z]{2}[0-9]{2}[A-Za-z0-9 ]{11,32}$', 'patternMessage': 'Bitte geben Sie eine gültige IBAN ein.'}))
        elif t == 'file-select':
            fields.append(strip_none({**base, 'type': 'file', 'multiple': bool(props.get('multiple')),
                                      'accept': ','.join(props.get('allowedExtensions') or []) or None}))
        elif t == 'combo-box' and 'addresses' in json.dumps(props):
            # ponytail: live address search API needs a Schalter session; plain address fields instead
            fields += [strip_none(x) for x in address(name, label, req)[:4]]
        elif t == 'combo-box':
            # ponytail: deadline options come from an authenticated API; a date picker covers it
            fields.append(strip_none({**base, 'type': 'date', 'min': 'today'}))
        else:
            raise SystemExit(f'unhandled formly type {t} ({name})')
    return fields


def convert_formly(raw_id):
    data = load_egh(raw_id)
    schema = json.loads(json.loads(data['egh-data-form-accelerator'])['jsonSchema'])
    names = {}
    stepper = (schema.get('properties') or {}).get('stepper')
    steps = []
    if stepper:
        for key, page in stepper['properties'].items():
            steps.append(dict(title=page.get('title') or key, note=clean_html(page.get('description')),
                              fields=formly_fields(key, page, names), _hide=((page.get('widget') or {}).get('formlyConfig') or {}).get('expressions', {}).get('hide')))
    else:
        steps.append(dict(title='Angaben', note=clean_html(schema.get('description')), fields=formly_fields('', schema, names)))
    for s in steps:
        h = s.pop('_hide', None)
        if h:
            s['rules'] = [formly_rule(h, names)]
    return dict(title=schema.get('title') or None, steps=[strip_none(s) for s in steps])


def load_egh(raw_id):
    for name in (f'{raw_id}-egh.json', f'{raw_id}-collect.json'):
        p = RAW / name
        if p.exists():
            d = json.loads(p.read_text())
            d = d.get('data', d)
            if 'egh-data-form-accelerator' in d:
                return d
    raise SystemExit(f'no formly schema captured for {raw_id}')


# ---------- CumulusPro (municipal) ----------

TECHNICAL = {'ExternalReferenceId', 'ExternalExecutionId', 'ExternalServiceId'}


def cumulus_rules(f, ids):
    rules = []
    for r in f.get('fieldRulesConfig') or []:
        if r['attribute'] not in ('hide', 'isRequired') or r['conditionField'] not in ids:
            continue
        rules.append(dict(attr='hide' if r['attribute'] == 'hide' else 'required', value=r['attributeValue'] == 'true',
                          op='=' if r['operator'] == '=' else '!=', field=ids[r['conditionField']], eq=r['conditionValue'] or ''))
    return rules or None


def convert_cumulus(raw_id):
    J = json.loads((RAW / f'{raw_id}-spa.json').read_text())
    fd = next(json.loads(j['body']) for j in J if re.search(r'FormDefinition/[0-9a-f-]{36}\?', j['url']))
    fields = sorted(fd['fields'], key=lambda f: f['sortOrder'])
    ids = {f['name']: f'f{f["id"]}' for f in fields}
    steps, cur = [], None

    def step(title, note=None):
        nonlocal cur
        cur = dict(title=title, note=note, fields=[])
        steps.append(cur)

    for f in fields:
        dt, label, req = f['datatype'], f['displayName'].strip(), bool(f['isRequired'])
        rules = cumulus_rules(f, ids)
        if dt == 'gemenide' or label in TECHNICAL or (f['hide'] and not rules):
            continue
        name = ids[f['name']]
        hidden = bool(f['hide'])
        desc = f.get('description')
        base = dict(name=name, label=label, required=req, hidden=hidden, rules=rules, hint=text_only(desc) if dt != 'formtext' else None)
        if cur is None and dt != 'formtext':
            step('Angaben')

        if dt == 'formtext':
            heading, rest = split_heading(desc)
            # Short headings start a new step; long ones are hint boxes inside the current step
            if heading and not hidden and len(heading) <= 70:
                step(heading, clean_html(rest))
            else:
                if cur is None:
                    step('Angaben')
                cur['fields'].append(strip_none(dict(name=name, label=heading or label, type='info', html=clean_html(rest if heading else desc),
                                                     hidden=hidden, rules=rules)))
        elif dt == 'string' and label == 'E-Mail':
            cur['fields'].append(strip_none({**base, 'type': 'email', 'inputMode': 'email'}))
        elif dt in ('string', 'number'):
            pattern = f['regularExpression'] or (r'^[0-9]+$' if dt == 'number' else None)
            msg = f['regularExpressionMessage'] or ('Bitte nur Ziffern eingeben.' if dt == 'number' else None)
            cur['fields'].append(strip_none({**base, 'type': 'text', 'pattern': pattern, 'patternMessage': msg,
                                             'inputMode': 'numeric' if dt == 'number' else None}))
        elif dt == 'text':
            cur['fields'].append(strip_none({**base, 'type': 'textarea'}))
        elif dt == 'date':
            adult = '18 Jahre' in (desc or '')
            cur['fields'].append(strip_none({**base, 'type': 'date', 'max': 'adult' if adult else None}))
        elif dt == 'email':
            cur['fields'].append(strip_none({**base, 'type': 'email', 'inputMode': 'email'}))
        elif dt == 'ahvnumber':
            cur['fields'].append(strip_none({**base, 'type': 'text', 'placeholder': '756.1234.5678.97',
                                             'pattern': r'^756\.?[0-9]{4}\.?[0-9]{4}\.?[0-9]{2}$',
                                             'patternMessage': 'Bitte im Format 756.1234.5678.97 eingeben.'}))
        elif dt in ('radio', 'lookup'):
            opts = [v['displayValue'] for v in f.get('lookupValues') or []]
            cur['fields'].append(strip_none({**base, 'type': 'radio' if dt == 'radio' or len(opts) <= 3 else 'select', 'options': opts}))
        elif dt == 'checkbox':
            cur['fields'].append(strip_none({**base, 'type': 'checkbox'}))
        elif dt == 'file':
            extra = json.loads(f.get('extras') or '{}')
            cur['fields'].append(strip_none({**base, 'type': 'file', 'multiple': bool(extra.get('isMultiple')),
                                             'accept': ','.join(extra.get('allowedFileTypes') or []) or None}))
        elif dt == 'address':
            prefix = '' if label == 'Adresse' else label
            cur['fields'] += [strip_none({**x, 'hidden': hidden}) for x in address(name, prefix or 'Adresse', req, rules)]
        elif dt == 'phonenumber':
            cur['fields'] += [strip_none({**x, 'hidden': hidden}) for x in phone(name, label, req, rules)]
        elif dt == 'deliveryoptions':
            opts = [o['value'] for o in (fd.get('deliveryConfig') or {}).get('deliveryOptions') or []]
            cur['fields'].append(strip_none({**base, 'type': 'radio', 'options': opts}))
        elif dt == 'paymentoptions':
            pc = fd.get('paymentConfig') or {}
            opts = [o['value'] for o in pc.get('paymentOptions') or []]
            fee = f"Gebühr: {pc['currency']} {pc['amount']:.2f}" if pc.get('amount') else None
            cur['fields'].append(strip_none({**base, 'type': 'radio', 'options': opts, 'hint': fee}))
        else:
            raise SystemExit(f'unhandled cumulus type {dt} ({label})')

    steps = [strip_none(s) for s in steps if s['fields'] or s.get('note')]
    return dict(title=fd['name'].strip(), steps=steps)


# Country list from a cantonal schema (same list the Schalter uses everywhere)
def countries():
    try:
        schema = json.loads(json.loads(load_egh('1117')['egh-data-form-accelerator'])['jsonSchema'])
        land = schema['properties']['stepper']['properties']['step1_personalien']['properties']['land']
        return [o['label'] for o in land['widget']['formlyConfig']['props']['options']]
    except Exception:
        return None


COUNTRIES = countries()

if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    for raw_id, sid in {**CANTONAL, **MUNICIPAL}.items():
        form = convert_formly(raw_id) if raw_id in CANTONAL else convert_cumulus(raw_id)
        (OUT / f'{sid}.json').write_text(json.dumps(form, ensure_ascii=False, indent=1) + '\n')
        n = sum(len(s['fields']) for s in form['steps'])
        print(f'{sid}: {form["title"]} – {len(form["steps"])} steps, {n} fields: {[s["title"] for s in form["steps"]]}')
