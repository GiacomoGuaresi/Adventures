import { Fragment, useState } from 'react'
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronRight, ExternalLink, MapPin, Pencil, Trash2 } from 'lucide-react'
import type { Coordinate } from '../dominio/coordinate'
import { mappaEsterna } from '../dominio/coordinate'
import { distanzaDaCasa, formattaDistanza } from '../dominio/distanza'
import { formattaDurata } from '../dominio/durata'
import { etichettaLink, perApertura } from '../dominio/link'
import { formattaViaggio } from '../dominio/viaggio'
import type { Colonna, Ordinamento } from '../dominio/ordinamento'
import { TESTI } from '../dominio/tipo'
import type { Attivita, Tipo } from '../dominio/tipi'
import { Markdown } from './Markdown'

interface Props {
  /** Trekking o avventure: cambia le colonne e i messaggi. */
  tipo: Tipo
  /** Solo quelli da mostrare: completati, ricerca e ordinamento sono già stati applicati. */
  attivita: readonly Attivita[]
  ordinamento: Ordinamento
  onOrdina: (colonna: Colonna) => void
  /** Il testo cercato: cambia il messaggio quando non si trova nulla. */
  ricerca: string
  /** Se c'è almeno un filtro acceso: cambia il messaggio dell'elenco vuoto. */
  conFiltri: boolean
  /** La posizione di casa: senza, la colonna della distanza non compare. */
  casa: Coordinate | null
  /** Quanti sono nascosti perché completati: cambia il messaggio dell'elenco vuoto. */
  nascosti: number
  onNuovo: () => void
  /** Toccando il nome si aprono i dettagli in sola lettura. */
  onDettagli: (attivita: Attivita) => void
  onCompletato: (attivita: Attivita) => void
  onRinomina: (attivita: Attivita) => void
  onElimina: (attivita: Attivita) => void
}

const data = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })

/**
 * L'elenco dei trekking o delle avventure (docs/09-interfaccia.md): il segno
 * del completato, il nome con il suo luogo e i suoi link, il dislivello e la
 * durata (solo per i trekking), la distanza e
 * il tempo di viaggio da casa, la data di aggiunta e i pulsanti per modificare o
 * eliminare. Chi ha delle note ha anche una freccia che le apre sotto la riga.
 * Toccando un'intestazione si ordina per quella colonna, un secondo tocco
 * inverte. Le altre colonne e i filtri arrivano con gli step successivi.
 */
export function Elenco({
  tipo,
  attivita,
  ordinamento,
  onOrdina,
  ricerca,
  conFiltri,
  casa,
  nascosti,
  onNuovo,
  onDettagli,
  onCompletato,
  onRinomina,
  onElimina,
}: Props) {
  /** Le note aperte, per id: restano aperte finché si guarda l'elenco. */
  const [aperte, setAperte] = useState<readonly string[]>([])
  const apriChiudi = (id: string) =>
    setAperte((prima) => (prima.includes(id) ? prima.filter((x) => x !== id) : [...prima, id]))

  const conNumeri = tipo === 'trekking'
  /** Le colonne dopo il nome, per la riga delle note che le attraversa tutte. */
  const colonneDopoNome = (conNumeri ? 2 : 0) + (casa === null ? 0 : 1) + 3

  if (attivita.length === 0) {
    const nessuno = TESTI[tipo].nessuno
    if (ricerca.trim() !== '') {
      return <p className="mt-8 text-center text-testo-tenue">{nessuno} con questo nome.</p>
    }
    if (conFiltri) {
      return <p className="mt-8 text-center text-testo-tenue">{nessuno} con questi filtri.</p>
    }
    if (nascosti > 0) {
      return (
        <p className="mt-8 text-center text-testo-tenue">
          {tipo === 'trekking' ? 'Sono tutti completati.' : 'Sono tutte completate.'}
        </p>
      )
    }
    return (
      <p className="mt-8 text-center text-testo-tenue">
        {nessuno}.{' '}
        <button type="button" className="font-semibold text-montagna-scura underline" onClick={onNuovo}>
          {tipo === 'trekking' ? 'Aggiungi il primo' : 'Aggiungi la prima'}
        </button>
        .
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-[11px] border border-bordo bg-white">
      <table className={`w-full border-collapse text-left ${conNumeri ? 'min-w-[780px]' : 'min-w-[560px]'}`}>
        <thead>
          <tr className="border-b border-bordo">
            <th className="w-11">
              <span className="sr-only">Completato</span>
            </th>
            <Intestazione colonna="nome" etichetta="Nome" ordinamento={ordinamento} onOrdina={onOrdina} />
            {conNumeri && (
              <>
                <Intestazione
                  colonna="dislivello"
                  etichetta="Dislivello"
                  ordinamento={ordinamento}
                  onOrdina={onOrdina}
                  stretta
                />
                <Intestazione
                  colonna="durata_ore"
                  etichetta="Durata"
                  ordinamento={ordinamento}
                  onOrdina={onOrdina}
                  stretta
                />
              </>
            )}
            {casa !== null && (
              <Intestazione
                colonna="distanza"
                etichetta="Da casa"
                ordinamento={ordinamento}
                onOrdina={onOrdina}
                stretta
              />
            )}
            <Intestazione
              colonna="viaggio_minuti"
              etichetta="Viaggio"
              ordinamento={ordinamento}
              onOrdina={onOrdina}
              stretta
            />
            <Intestazione
              colonna="creato_il"
              etichetta="Aggiunto"
              ordinamento={ordinamento}
              onOrdina={onOrdina}
              stretta
            />
            <th className="w-24">
              <span className="sr-only">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {attivita.map((t) => (
            <Fragment key={t.id}>
              <tr className="border-b border-bordo last:border-0">
                <td className="py-1 pl-1">
                  <button
                    type="button"
                    className="grid size-11 place-items-center rounded-full hover:bg-fondo"
                    aria-pressed={t.completato}
                    aria-label={t.completato ? `Togli il completato a ${t.nome}` : `Segna ${t.nome} come completato`}
                    onClick={() => onCompletato(t)}
                  >
                    <span
                      className={`grid size-[22px] place-items-center rounded-full border ${
                        t.completato ? 'border-montagna-scura bg-montagna-scura text-panna' : 'border-bordo'
                      }`}
                    >
                      {t.completato && <Check className="size-[15px]" aria-hidden="true" />}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-1">
                    {t.note && (
                      <button
                        type="button"
                        className="-ml-1 grid size-6 shrink-0 place-items-center rounded text-testo-tenue hover:bg-fondo"
                        aria-expanded={aperte.includes(t.id)}
                        aria-label={aperte.includes(t.id) ? `Chiudi le note di ${t.nome}` : `Apri le note di ${t.nome}`}
                        onClick={() => apriChiudi(t.id)}
                      >
                        {aperte.includes(t.id) ? (
                          <ChevronDown className="size-[17px]" aria-hidden="true" />
                        ) : (
                          <ChevronRight className="size-[17px]" aria-hidden="true" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`text-left font-semibold hover:underline ${t.completato ? 'text-testo-tenue line-through' : ''}`}
                      onClick={() => onDettagli(t)}
                    >
                      {t.nome}
                    </button>
                  </span>
                  {(t.luogo_nome !== null || t.lat !== null || t.link.length > 0) && (
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {t.luogo_nome !== null && t.lat === null && (
                        <span className="inline-flex items-center gap-1 text-xs text-testo-tenue">
                          <MapPin className="size-[13px]" aria-hidden="true" />
                          {t.luogo_nome}
                        </span>
                      )}
                      {t.lat !== null && t.lon !== null && (
                        <a
                          href={mappaEsterna({ lat: t.lat, lon: t.lon })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-montagna-scura underline"
                        >
                          <MapPin className="size-[13px]" aria-hidden="true" />
                          {t.luogo_nome ?? `${t.lat.toFixed(4)}, ${t.lon.toFixed(4)}`}
                        </a>
                      )}
                      {t.link.map((indirizzo) => (
                        <Link key={indirizzo} indirizzo={indirizzo} />
                      ))}
                    </span>
                  )}
                </td>
                {conNumeri && (
                  <>
                    <td className="px-3 py-2 whitespace-nowrap text-testo-tenue">
                      {t.dislivello === null ? '—' : `${t.dislivello} m`}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-testo-tenue">{formattaDurata(t.durata_ore)}</td>
                  </>
                )}
                {casa !== null && (
                  <td className="px-3 py-2 whitespace-nowrap text-testo-tenue">
                    {formattaDistanza(distanzaDaCasa(t, casa))}
                  </td>
                )}
                <td className="px-3 py-2 whitespace-nowrap text-testo-tenue">{formattaViaggio(t.viaggio_minuti)}</td>
                <td className="px-3 py-2 whitespace-nowrap text-testo-tenue">{data.format(new Date(t.creato_il))}</td>
                <td className="py-1 pr-1">
                  <div className="flex justify-end gap-0.5">
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-[11px] text-testo-tenue hover:bg-fondo"
                      aria-label={`Modifica ${t.nome}`}
                      onClick={() => onRinomina(t)}
                    >
                      <Pencil className="size-[18px]" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-[11px] text-testo-tenue hover:bg-fondo hover:text-pericolo"
                      aria-label={`Elimina ${t.nome}`}
                      onClick={() => onElimina(t)}
                    >
                      <Trash2 className="size-[18px]" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
              {t.note && aperte.includes(t.id) && (
                <tr className="border-b border-bordo last:border-0">
                  <td />
                  <td className="px-3 pt-0 pb-3" colSpan={1 + colonneDopoNome}>
                    <div className="animate-entra">
                      <Markdown testo={t.note} />
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface PropsIntestazione {
  colonna: Colonna
  etichetta: string
  ordinamento: Ordinamento
  onOrdina: (colonna: Colonna) => void
  stretta?: boolean
}

/** Un'intestazione su cui si può toccare per ordinare, con la freccia del verso. */
function Intestazione({ colonna, etichetta, ordinamento, onOrdina, stretta = false }: PropsIntestazione) {
  const attiva = ordinamento.colonna === colonna
  const Freccia = ordinamento.verso === 'crescente' ? ArrowUp : ArrowDown

  return (
    <th
      className={stretta ? 'w-px' : undefined}
      aria-sort={attiva ? (ordinamento.verso === 'crescente' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-1 px-3 font-semibold whitespace-nowrap hover:bg-fondo"
        onClick={() => onOrdina(colonna)}
      >
        {etichetta}
        {attiva && <Freccia className="size-[15px] text-montagna-scura" aria-hidden="true" />}
      </button>
    </th>
  )
}

/** Un link dell'attività, apribile dall'elenco (docs/02-funzionalita.md). */
function Link({ indirizzo }: { indirizzo: string }) {
  const apribile = perApertura(indirizzo)
  const etichetta = etichettaLink(indirizzo)

  if (apribile === null) {
    return <span className="text-xs text-testo-tenue">{etichetta}</span>
  }

  return (
    <a
      href={apribile}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-montagna-scura underline"
    >
      <ExternalLink className="size-[13px]" aria-hidden="true" />
      {etichetta}
    </a>
  )
}
