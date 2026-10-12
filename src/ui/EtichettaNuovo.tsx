import { useEffect, useRef, useState } from 'react'
import { TESTI, TIPI } from '../dominio/tipo'
import type { Tipo } from '../dominio/tipi'

/** Ogni quanto la scritta passa da "Nuovo trekking" a "Nuova avventura" e ritorno. */
const OGNI = 5000

/**
 * Il tipo che il pulsante "+" propone in questo momento: si alterna da solo,
 * e chi tocca apre il form su quello che sta leggendo. Parte dal tipo della
 * pagina, così sull'elenco delle avventure la prima scritta è "Nuova avventura".
 */
export function useTipoAlterno(iniziale: Tipo): Tipo {
  const [tipo, setTipo] = useState(iniziale)

  useEffect(() => {
    setTipo(iniziale)
    const giro = window.setInterval(
      () => setTipo((prima) => TIPI[(TIPI.indexOf(prima) + 1) % TIPI.length]),
      OGNI,
    )
    return () => window.clearInterval(giro)
  }, [iniziale])

  return tipo
}

/**
 * La scritta del pulsante "+" (docs/09-interfaccia.md): quella del tipo
 * corrente entra dal basso mentre l'altra esce verso l'alto, tutte e due
 * sfumando. Le due scritte occupano la stessa cella, larga quanto la più
 * lunga, così il pulsante non cambia misura. I lettori di schermo leggono
 * l'`aria-label` fisso del pulsante, non questa.
 */
export function EtichettaNuovo({ tipo, className = '' }: { tipo: Tipo; className?: string }) {
  // Alla prima comparsa niente si muove: l'animazione parte dal primo cambio.
  const primo = useRef(tipo)
  const cambiato = useRef(false)
  if (tipo !== primo.current) cambiato.current = true

  return (
    <span className={`inline-grid overflow-hidden text-left ${className}`} aria-hidden="true">
      {TIPI.map((t) => (
        <span
          key={t}
          className={`col-start-1 row-start-1 whitespace-nowrap ${
            cambiato.current ? (t === tipo ? 'animate-sale' : 'animate-esce') : t === tipo ? '' : 'opacity-0'
          }`}
        >
          {TESTI[t].nuovo}
        </span>
      ))}
    </span>
  )
}

/** Quello che dice il pulsante a chi non vede la scritta alternarsi. */
export const NUOVO = 'Nuovo trekking o nuova avventura'
