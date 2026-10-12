import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { dislivelloValido, pulisciDislivello, testoDislivello } from '../dominio/dislivello'
import { durataValida, pulisciDurata, testoDurata } from '../dominio/durata'
import { pulisciLink } from '../dominio/link'
import { nomeValido, pulisciNome } from '../dominio/nome'
import { doppione } from '../dominio/ricerca'
import { pulisciViaggio, testoViaggio, viaggioManuale, viaggioValido } from '../dominio/viaggio'
import type { CampiAttivita, Attivita } from '../dominio/tipi'
import { EditorMarkdown } from './EditorMarkdown'
import { CampoLuogo } from './CampoLuogo'
import { CampoTempo } from './CampoTempo'
import { Modale } from './Modale'
import { luogoValido, risolviLuogo, statoLuogoIniziale } from './luogo'

interface Props {
  /** "Nuovo trekking" quando si crea, "Modifica trekking" quando si cambia. */
  titolo: string
  iniziale?: CampiAttivita
  /** Tutti i trekking, per avvisare dei doppioni mentre si scrive. */
  esistenti: readonly Attivita[]
  /** Il trekking che si sta modificando: non è doppione di sé stesso. */
  escludi?: string
  onSalva: (campi: CampiAttivita) => Promise<unknown>
  onChiudi: () => void
  /** Solo in modifica: in fondo al form compare "Elimina trekking". */
  onElimina?: () => void
}

const CAMPO =
  'min-h-11 w-full rounded-[11px] border border-bordo bg-white px-3 focus:outline-2 focus:-outline-offset-1 focus:outline-montagna'

const PASSI = ['Dove', 'Quanto', 'Link', 'Note'] as const
const ULTIMO = PASSI.length - 1

/**
 * Il form del trekking (docs/02-funzionalita.md, inserimento rapido), pensato
 * per il telefono: a schermo intero, un wizard in quattro passi (dove, quanto,
 * link, note) con "Indietro" e "Avanti" sempre in vista in fondo. Serve solo il
 * nome; il luogo si scrive per nome o per coordinate, i link uno per campo, le
 * note in Markdown. Un trekking nuovo si salva all'ultimo passo; in modifica
 * "Salva" c'è a ogni passo e dall'indicatore si salta dove serve.
 */
export function ModaleAttivita({ titolo, iniziale, esistenti, escludi, onSalva, onChiudi, onElimina }: Props) {
  const [passo, setPasso] = useState(0)
  const [nome, setNome] = useState(iniziale?.nome ?? '')
  const [link, setLink] = useState<string[]>(() => (iniziale?.link.length ? [...iniziale.link] : ['']))
  const [note, setNote] = useState(iniziale?.note ?? '')
  const [dislivello, setDislivello] = useState(testoDislivello(iniziale?.dislivello ?? null))
  const [durata, setDurata] = useState(testoDurata(iniziale?.durata_ore ?? null))
  const [luogo, setLuogo] = useState(() => statoLuogoIniziale(iniziale))
  const [viaggio, setViaggio] = useState(testoViaggio(iniziale?.viaggio_minuti ?? null))
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const id = useId()
  // L'avviso compare mentre si scrive e non blocca il salvataggio
  // (docs/02-funzionalita.md).
  const gia = doppione(esistenti, nome, escludi)
  /** Chi ha un campo storto ferma il wizard lì: link e note vanno sempre bene. */
  const passiValidi = [
    nomeValido(nome) && luogoValido(luogo),
    dislivelloValido(dislivello) && durataValida(durata) && viaggioValido(viaggio),
    true,
    true,
  ]
  const valido = passiValidi.every(Boolean)
  /** Si arriva fino al primo passo storto compreso, non oltre. */
  const raggiungibile = (indice: number) => passiValidi.slice(0, indice).every(Boolean)
  const salvabile = valido && (passo === ULTIMO || iniziale !== undefined)

  // Invio dentro un campo porta avanti; solo all'ultimo passo salva.
  const invia = (evento: FormEvent) => {
    evento.preventDefault()
    if (passo < ULTIMO) {
      if (passiValidi[passo]) setPasso(passo + 1)
      return
    }
    void salva()
  }

  const salva = async () => {
    if (!valido || inCorso) return
    setInCorso(true)
    setErrore(null)
    const minuti = pulisciViaggio(viaggio)
    try {
      const salvato = await risolviLuogo(luogo)
      await onSalva({
        nome: pulisciNome(nome),
        link: pulisciLink(link.join('\n')),
        note: note.trim() === '' ? null : note,
        dislivello: pulisciDislivello(dislivello),
        durata_ore: pulisciDurata(durata),
        viaggio_minuti: minuti,
        viaggio_manuale: viaggioManuale(minuti, iniziale ?? null),
        ...salvato,
      })
      onChiudi()
    } catch (e) {
      setErrore((e as Error).message)
      setInCorso(false)
    }
  }

  const cambiaLink = (indice: number, valore: string) =>
    setLink((prima) => prima.map((l, i) => (i === indice ? valore : l)))
  const togliLink = (indice: number) =>
    setLink((prima) => (prima.length === 1 ? [''] : prima.filter((_, i) => i !== indice)))

  return (
    <Modale
      titolo={titolo}
      onChiudi={onChiudi}
      mobile="schermoIntero"
      piede={
        <>
          {errore && (
            <p className="m-0 w-full text-xs text-pericolo" role="alert">
              {errore}
            </p>
          )}
          <button
            type="button"
            className="flex min-h-11 flex-1 items-center justify-center gap-1 rounded-[11px] border border-bordo px-4 font-semibold text-testo-tenue hover:bg-fondo sm:mr-auto sm:flex-none sm:border-0"
            onClick={passo === 0 ? onChiudi : () => setPasso(passo - 1)}
          >
            {passo === 0 ? (
              'Annulla'
            ) : (
              <>
                <ChevronLeft className="size-[18px]" aria-hidden="true" />
                Indietro
              </>
            )}
          </button>
          {passo < ULTIMO && iniziale !== undefined && (
            <button
              type="button"
              className="min-h-11 flex-1 rounded-[11px] border border-montagna px-4 font-semibold text-montagna-scura hover:bg-fondo disabled:opacity-50 sm:flex-none"
              disabled={!salvabile || inCorso}
              onClick={() => void salva()}
            >
              {inCorso ? 'Salvo…' : 'Salva'}
            </button>
          )}
          {passo < ULTIMO ? (
            <button
              type="button"
              className="flex min-h-11 flex-[2] items-center justify-center gap-1 rounded-[11px] bg-montagna px-4 font-semibold text-panna hover:bg-montagna-scura disabled:opacity-50 sm:flex-none"
              disabled={!passiValidi[passo]}
              onClick={() => setPasso(passo + 1)}
            >
              Avanti
              <ChevronRight className="size-[18px]" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              form={id}
              className="min-h-11 flex-[2] rounded-[11px] bg-montagna px-4 font-semibold text-panna hover:bg-montagna-scura disabled:opacity-50 sm:flex-none"
              disabled={!salvabile || inCorso}
            >
              {inCorso ? 'Salvo…' : 'Salva'}
            </button>
          )}
        </>
      }
    >
      <ol className="m-0 mb-5 grid list-none grid-cols-4 gap-1.5 p-0" aria-label="Passi">
        {PASSI.map((nomePasso, indice) => (
          <li key={nomePasso}>
            <button
              type="button"
              className="flex w-full flex-col gap-1 text-left text-xs font-semibold text-testo-tenue disabled:opacity-50 aria-[current=step]:text-montagna-scura"
              aria-current={indice === passo ? 'step' : undefined}
              disabled={!raggiungibile(indice)}
              onClick={() => setPasso(indice)}
            >
              <span className={`h-1 w-full rounded-full ${indice <= passo ? 'bg-montagna' : 'bg-bordo'}`} />
              {nomePasso}
            </button>
          </li>
        ))}
      </ol>
      <form id={id} className="flex flex-col gap-6" onSubmit={invia}>
        {passo === 0 && (
          <Gruppo titolo="Dove">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" htmlFor={`${id}-nome`}>
                Nome <span className="font-normal text-testo-tenue">(obbligatorio)</span>
              </label>
              <input
                id={`${id}-nome`}
                aria-required="true"
                className={CAMPO}
                // Solo per un trekking nuovo: in modifica la tastiera coprirebbe metà form.
                autoFocus={!iniziale}
                autoCapitalize="sentences"
                enterKeyHint="next"
                placeholder="Pizzo Coca"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
              />
              {gia && (
                <p className="m-0 text-xs text-testo-tenue">
                  Esiste già un trekking che si chiama <strong>{gia.nome}</strong>.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <CampoLuogo valore={luogo} onCambia={setLuogo} />
            </div>
          </Gruppo>
        )}

        {passo === 1 && (
          <Gruppo titolo="Quanto">
            <CampoNumero
              id={`${id}-dislivello`}
              etichetta="Dislivello"
              unita="m"
              placeholder="1200"
              valore={dislivello}
              onCambia={setDislivello}
              storto={!dislivelloValido(dislivello)}
            />
            {!dislivelloValido(dislivello) && (
              <p className="m-0 text-xs text-pericolo">Il dislivello sono metri interi, sopra lo zero.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <CampoTempo
                id={`${id}-durata`}
                etichetta="Durata A/R"
                segnaposto={{ ore: '3', minuti: '30' }}
                valore={durata}
                onCambia={setDurata}
                storto={!durataValida(durata)}
              />
              <CampoTempo
                id={`${id}-viaggio`}
                etichetta="Viaggio"
                segnaposto={{ ore: '1', minuti: '15' }}
                valore={viaggio}
                onCambia={setViaggio}
                storto={!viaggioValido(viaggio)}
              />
            </div>
            {!durataValida(durata) && (
              <p className="m-0 text-xs text-pericolo">La durata va a mezz'ore: 3 h o 3 h 30, non 3 h 20.</p>
            )}
            <p className="m-0 text-xs text-testo-tenue">Il viaggio scritto a mano non verrà ricalcolato.</p>
          </Gruppo>
        )}

        {passo === 2 && (
          <Gruppo titolo="Link">
            {link.map((indirizzo, indice) => (
              <div key={indice} className="flex items-center gap-1">
                <label className="sr-only" htmlFor={`${id}-link-${indice}`}>
                  Link {indice + 1}
                </label>
                <input
                  id={`${id}-link-${indice}`}
                  type="url"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className={CAMPO}
                  placeholder="https://www.komoot.com/tour/..."
                  value={indirizzo}
                  onChange={(evento) => cambiaLink(indice, evento.target.value)}
                />
                {(link.length > 1 || indirizzo !== '') && (
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center rounded-[11px] text-testo-tenue hover:bg-fondo"
                    aria-label={`Togli il link ${indice + 1}`}
                    onClick={() => togliLink(indice)}
                  >
                    <X className="size-[18px]" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
            {link[link.length - 1].trim() !== '' && (
              <button
                type="button"
                className="flex min-h-11 w-fit items-center gap-1.5 rounded-[11px] px-2 font-semibold text-montagna-scura hover:bg-fondo"
                onClick={() => setLink((prima) => [...prima, ''])}
              >
                <Plus className="size-[18px]" aria-hidden="true" />
                Aggiungi un link
              </button>
            )}
          </Gruppo>
        )}

        {passo === ULTIMO && (
          <Gruppo titolo="Note">
            <EditorMarkdown valore={note} onCambia={setNote} etichetta="Note" righe={8} />
          </Gruppo>
        )}

        {onElimina && (
          <button
            type="button"
            className="flex min-h-11 w-fit items-center gap-1.5 self-center rounded-[11px] px-3 font-semibold text-pericolo hover:bg-fondo"
            onClick={onElimina}
          >
            <Trash2 className="size-[18px]" aria-hidden="true" />
            Elimina trekking
          </button>
        )}
      </form>
    </Modale>
  )
}

/** Un passo del wizard: il titolo si vede già nell'indicatore, qui resta per i lettori di schermo. */
function Gruppo({ titolo, children }: { titolo: string; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="sr-only">{titolo}</legend>
      {children}
    </fieldset>
  )
}

interface PropsNumero {
  id: string
  etichetta: string
  /** L'unità scritta dentro il campo, a destra. */
  unita: string
  placeholder: string
  valore: string
  onCambia: (testo: string) => void
  storto: boolean
}

/**
 * Un numero con la sua unità. È un campo di testo con la tastiera numerica: con
 * `type="number"` la virgola italiana di iOS si perderebbe.
 */
function CampoNumero({ id, etichetta, unita, placeholder, valore, onCambia, storto }: PropsNumero) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="truncate text-sm font-semibold" htmlFor={id}>
        {etichetta}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          enterKeyHint="next"
          aria-invalid={storto}
          className={`${CAMPO} pr-10 ${storto ? 'border-pericolo' : ''}`}
          placeholder={placeholder}
          value={valore}
          onChange={(evento) => onCambia(evento.target.value)}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-testo-tenue">
          {unita}
        </span>
      </div>
    </div>
  )
}
