import { useState } from 'react'

// Le preferenze dell'interfaccia, salvate in un cookie per ciascuna: restano
// tra una visita e l'altra sullo stesso dispositivo. Stesso meccanismo di
// Projects.

/** Un anno: una preferenza scelta resta finché non la si cambia. */
const DURATA = 60 * 60 * 24 * 365

/** Il valore del cookie `nome` nel testo di `document.cookie`, o null se non c'è. */
export function leggiCookie(testo: string, nome: string): string | null {
  for (const pezzo of testo.split(';')) {
    const uguale = pezzo.indexOf('=')
    if (uguale < 0) continue
    if (pezzo.slice(0, uguale).trim() === nome) return decodeURIComponent(pezzo.slice(uguale + 1).trim())
  }
  return null
}

/**
 * Un interruttore acceso/spento salvato nel cookie `nome`. Il percorso è quello
 * dell'app (`/Adventures/`), così non si mescola con i cookie delle altre app.
 */
export function useInterruttore(nome: string, predefinito: boolean): [boolean, (acceso: boolean) => void] {
  const [acceso, setAcceso] = useState(() => {
    const salvato = leggiCookie(document.cookie, nome)
    return salvato === null ? predefinito : salvato === '1'
  })

  const cambia = (nuovo: boolean) => {
    setAcceso(nuovo)
    document.cookie = `${nome}=${nuovo ? '1' : '0'}; path=${import.meta.env.BASE_URL}; max-age=${DURATA}; SameSite=Lax`
  }

  return [acceso, cambia]
}
