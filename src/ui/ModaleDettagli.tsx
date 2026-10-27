import type { ReactNode } from 'react'
import { Car, Check, Clock, ExternalLink, House, MapPin, Mountain, MountainSnow, Pencil, Ruler, Timer, TrendingUp, type LucideIcon } from 'lucide-react'
import type { Coordinate } from '../dominio/coordinate'
import { mappaEsterna } from '../dominio/coordinate'
import { giorno, km, metri, ore } from '../dominio/completamento'
import { distanzaDaCasa, formattaDistanza } from '../dominio/distanza'
import { formattaDurata } from '../dominio/durata'
import { etichettaLink, perApertura } from '../dominio/link'
import { TESTI } from '../dominio/tipo'
import type { Attivita } from '../dominio/tipi'
import { formattaViaggio } from '../dominio/viaggio'
import { Markdown } from './Markdown'
import { Modale } from './Modale'

interface Props {
  attivita: Attivita
  casa: Coordinate | null
  onModifica: () => void
  /** Segna il completato (apre il flusso col giro) o lo toglie (chiede conferma). */
  onCompletato: () => void
  onChiudi: () => void
}

const data = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * I dettagli di un trekking o di un'avventura in sola lettura
 * (docs/02-funzionalita.md): luogo, numeri (per l'avventura solo quelli del
 * viaggio), link e note, pensati per il telefono. Sul telefono è un foglio che
 * sale dal basso. In fondo "Modifica" apre il form, e si può segnare il
 * completato senza passare dal form. Da completato ci sono anche il giorno del
 * giro e i numeri veri.
 */
export function ModaleDettagli({ attivita: t, casa, onModifica, onCompletato, onChiudi }: Props) {
  const fatti: [LucideIcon, string, string][] = [
    ...(t.fatto_dislivello === null ? [] : [[TrendingUp, 'Dislivello fatto', metri(t.fatto_dislivello)] as [LucideIcon, string, string]]),
    ...(t.fatto_km === null ? [] : [[Ruler, 'Lunghezza', km(t.fatto_km)] as [LucideIcon, string, string]]),
    ...(t.fatto_quota_max === null ? [] : [[MountainSnow, 'Quota massima', metri(t.fatto_quota_max)] as [LucideIcon, string, string]]),
    ...(t.fatto_durata_minuti === null ? [] : [[Timer, 'Durata fatta', ore(t.fatto_durata_minuti)] as [LucideIcon, string, string]]),
  ]

  const numeri: [LucideIcon, string, string][] = [
    ...(t.tipo === 'trekking'
      ? ([
          [Mountain, 'Dislivello', t.dislivello === null ? '—' : `${t.dislivello} m`],
          [Clock, 'Durata', formattaDurata(t.durata_ore)],
        ] as [LucideIcon, string, string][])
      : []),
    [Car, 'Viaggio', formattaViaggio(t.viaggio_minuti)],
    ...(casa === null ? [] : [[House, 'Da casa', formattaDistanza(distanzaDaCasa(t, casa))] as [LucideIcon, string, string]]),
  ]

  return (
    <Modale
      titolo={t.nome}
      onChiudi={onChiudi}
      mobile="foglio"
      piede={
        <>
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[11px] border border-bordo px-4 font-semibold text-testo-tenue hover:bg-fondo sm:flex-none"
            aria-pressed={t.completato}
            onClick={onCompletato}
          >
            <Check className="size-[18px]" aria-hidden="true" />
            {t.completato ? 'Togli completato' : TESTI[t.tipo].completato}
          </button>
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-montagna px-4 font-semibold text-panna hover:bg-montagna-scura sm:flex-none"
            onClick={onModifica}
          >
            <Pencil className="size-[18px]" aria-hidden="true" />
            Modifica
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {(t.completato || t.luogo_nome !== null || t.lat !== null) && (
          <div className="flex flex-col gap-2">
            {t.completato && (
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-ghiaccio px-2.5 py-1 text-xs font-semibold text-montagna-scura">
                <Check className="size-[14px]" aria-hidden="true" />
                {t.completato_il ? `Fatto il ${giorno(t.completato_il)}` : 'Completato'}
              </span>
            )}
            {t.lat !== null && t.lon !== null ? (
              <a
                href={mappaEsterna({ lat: t.lat, lon: t.lon })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 rounded-[11px] border border-bordo px-3 text-montagna-scura hover:bg-fondo"
              >
                <MapPin className="size-[18px] shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">
                  {t.luogo_nome ?? `${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`}
                </span>
                <span className="shrink-0 text-xs text-testo-tenue">Apri in Maps</span>
              </a>
            ) : (
              t.luogo_nome !== null && (
                <span className="flex items-center gap-2 text-testo-tenue">
                  <MapPin className="size-[18px] shrink-0" aria-hidden="true" />
                  {t.luogo_nome}
                </span>
              )
            )}
          </div>
        )}

        {fatti.length > 0 && (
          <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fatti.map(([Icona, etichetta, valore]) => (
              <div key={etichetta} className="rounded-[11px] bg-ghiaccio px-3 py-2">
                <dt className="flex items-center gap-1.5 text-xs text-montagna-scura">
                  <Icona className="size-[14px]" aria-hidden="true" />
                  {etichetta}
                </dt>
                <dd className="m-0 mt-0.5 text-base font-semibold">{valore}</dd>
              </div>
            ))}
          </dl>
        )}

        <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {numeri.map(([Icona, etichetta, valore]) => (
            <div key={etichetta} className="rounded-[11px] bg-fondo px-3 py-2">
              <dt className="flex items-center gap-1.5 text-xs text-testo-tenue">
                <Icona className="size-[14px]" aria-hidden="true" />
                {etichetta}
              </dt>
              <dd className="m-0 mt-0.5 text-base font-semibold">{valore}</dd>
            </div>
          ))}
        </dl>

        {t.link.length > 0 && (
          <Sezione titolo="Link">
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {t.link.map((indirizzo) => (
                <li key={indirizzo}>
                  <Link indirizzo={indirizzo} />
                </li>
              ))}
            </ul>
          </Sezione>
        )}

        {t.note && (
          <Sezione titolo="Note">
            <Markdown testo={t.note} />
          </Sezione>
        )}

        <p className="m-0 text-xs text-testo-tenue">Aggiunto il {data.format(new Date(t.creato_il))}</p>
        {t.viaggio_minuti !== null && !t.viaggio_manuale && (
          <p className="m-0 text-xs text-testo-tenue">
            Tempo di viaggio calcolato con{' '}
            <a href="https://openrouteservice.org" target="_blank" rel="noopener noreferrer" className="underline">
              openrouteservice.org
            </a>{' '}
            by HeiGIT, dati © OpenStreetMap
          </p>
        )}
      </div>
    </Modale>
  )
}

function Sezione({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-testo-tenue uppercase">{titolo}</h3>
      {children}
    </section>
  )
}

/** Un link grande da toccare; chi non ha la forma di un indirizzo resta testo. */
function Link({ indirizzo }: { indirizzo: string }) {
  const apribile = perApertura(indirizzo)
  const etichetta = etichettaLink(indirizzo)

  if (apribile === null) {
    return <span className="flex min-h-11 items-center px-3 text-testo-tenue">{etichetta}</span>
  }

  return (
    <a
      href={apribile}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-11 items-center gap-2 rounded-[11px] border border-bordo px-3 text-montagna-scura hover:bg-fondo"
    >
      <ExternalLink className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{etichetta}</span>
    </a>
  )
}
