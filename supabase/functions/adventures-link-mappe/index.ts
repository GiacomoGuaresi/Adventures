// Apre un link breve di Google Maps (maps.app.goo.gl) e restituisce il link
// lungo a cui porta (docs/03-architettura.md). Il browser non può farlo da
// solo: Google non manda le intestazioni CORS e il redirect resta invisibile.
//
// Apre solo link di Google Maps, segue al massimo pochi redirect e accetta
// solo chi ha la sessione. Il controllo del JWT di Supabase (verify_jwt) lascia
// passare anche la publishable key, che è pubblica nel sito: per questo qui si
// chiede ad Auth chi è l'utente. Non legge e non scrive il database.

const ORIGINI = ['https://giacomoguaresi.github.io', 'http://localhost:5173', 'http://localhost:4173']
const MAX_REDIRECT = 4

function cors(origine: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origine && ORIGINI.includes(origine) ? origine : ORIGINI[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function linkBreve(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    (url.hostname === 'maps.app.goo.gl' || (url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/')))
  )
}

function linkLungo(url: URL): boolean {
  const host = url.hostname.replace(/^www\./, '')
  const dominio = String.raw`google\.(?:com|[a-z]{2}|com?\.[a-z]{2})`
  return (
    url.protocol === 'https:' &&
    ((new RegExp(`^${dominio}$`).test(host) && url.pathname.startsWith('/maps')) ||
      new RegExp(`^maps\\.${dominio}$`).test(host))
  )
}

/** C'è una sessione vera: Auth riconosce il token come un utente. */
async function conSessione(autorizzazione: string | null): Promise<boolean> {
  if (!autorizzazione?.startsWith('Bearer ')) return false
  const risposta = await fetch(`${Deno.env.get('SUPABASE_URL')}/auth/v1/user`, {
    headers: { Authorization: autorizzazione, apikey: Deno.env.get('SUPABASE_ANON_KEY') ?? '' },
    signal: AbortSignal.timeout(5000),
  })
  await risposta.body?.cancel()
  return risposta.ok
}

/** Segue i redirect uno alla volta, senza mai uscire da Google Maps. */
async function apri(inizio: URL): Promise<string | null> {
  let url = inizio
  for (let i = 0; i < MAX_REDIRECT; i++) {
    const risposta = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) })
    await risposta.body?.cancel()
    const destinazione = risposta.headers.get('location')
    if (risposta.status < 300 || risposta.status >= 400 || !destinazione) return null
    url = new URL(destinazione, url)
    if (linkLungo(url)) return url.href
    if (!linkBreve(url)) return null
  }
  return null
}

Deno.serve(async (richiesta) => {
  const intestazioni = cors(richiesta.headers.get('origin'))
  if (richiesta.method === 'OPTIONS') return new Response('ok', { headers: intestazioni })
  const json = (corpo: unknown, stato = 200) =>
    new Response(JSON.stringify(corpo), { status: stato, headers: { ...intestazioni, 'Content-Type': 'application/json' } })

  if (richiesta.method !== 'POST') return json({ errore: 'Solo POST' }, 405)
  if (!(await conSessione(richiesta.headers.get('authorization')))) return json({ errore: 'Serve l\'accesso' }, 401)
  let link: URL
  try {
    const { url } = await richiesta.json()
    link = new URL(String(url))
  } catch {
    return json({ errore: 'Serve { "url": "https://maps.app.goo.gl/..." }' }, 400)
  }
  if (!linkBreve(link)) return json({ errore: 'Solo link brevi di Google Maps' }, 400)

  try {
    const lungo = await apri(link)
    return lungo ? json({ url: lungo }) : json({ errore: 'Il link non porta a Google Maps' }, 422)
  } catch {
    return json({ errore: 'Google Maps non ha risposto' }, 502)
  }
})
