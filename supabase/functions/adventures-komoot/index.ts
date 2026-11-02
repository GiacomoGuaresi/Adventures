// Legge un giro di Komoot dalla sua pagina e ne restituisce i numeri
// (docs/03-architettura.md). Il browser non può farlo da solo: Komoot non
// manda le intestazioni CORS.
//
// Accetta solo link di Komoot e scarica solo la pagina del giro, costruita
// dall'id: nessun indirizzo arbitrario. Come `adventures-link-mappe` accetta
// solo chi ha la sessione: il controllo del JWT di Supabase (verify_jwt) lascia
// passare anche la publishable key, che è pubblica nel sito, quindi qui si
// chiede ad Auth chi è l'utente. Non legge e non scrive il database.

import { leggiTour, paginaKomoot, riferimentoKomoot } from './tour.ts'

const ORIGINI = ['https://giacomoguaresi.github.io', 'http://localhost:5173', 'http://localhost:4173']

function cors(origine: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origine && ORIGINI.includes(origine) ? origine : ORIGINI[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
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

Deno.serve(async (richiesta) => {
  const intestazioni = cors(richiesta.headers.get('origin'))
  if (richiesta.method === 'OPTIONS') return new Response('ok', { headers: intestazioni })
  const json = (corpo: unknown, stato = 200) =>
    new Response(JSON.stringify(corpo), { status: stato, headers: { ...intestazioni, 'Content-Type': 'application/json' } })

  if (richiesta.method !== 'POST') return json({ errore: 'Solo POST' }, 405)
  if (!(await conSessione(richiesta.headers.get('authorization')))) return json({ errore: 'Serve l\'accesso' }, 401)
  let url: string
  try {
    url = String((await richiesta.json()).url)
  } catch {
    return json({ errore: 'Serve { "url": "https://www.komoot.com/tour/..." }' }, 400)
  }
  const rif = riferimentoKomoot(url)
  if (!rif) return json({ errore: 'Solo link di giri Komoot' }, 400)

  let html: string
  try {
    // La pagina è grande (2–3 MB): più tempo che per i redirect di Maps.
    const risposta = await fetch(paginaKomoot(rif), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Adventures)', 'Accept-Language': 'it-IT,it;q=0.9' },
      signal: AbortSignal.timeout(10000),
    })
    if (risposta.status === 404 || risposta.status === 403) {
      await risposta.body?.cancel()
      return json({ errore: 'Giro non trovato o privato' }, 404)
    }
    if (!risposta.ok) {
      await risposta.body?.cancel()
      return json({ errore: 'Komoot non ha risposto' }, 502)
    }
    html = await risposta.text()
  } catch {
    return json({ errore: 'Komoot non ha risposto' }, 502)
  }
  const tour = leggiTour(html, rif)
  return tour ? json(tour) : json({ errore: 'Nella pagina non ci sono i dati del giro' }, 422)
})
