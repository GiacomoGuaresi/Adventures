import { piattaforma, type Piattaforma, type StatoInstallazione } from './installazione'

/** Come si installa a mano, dove il browser non dà il suo prompt. */
const istruzioni: Record<Piattaforma, string[]> = {
  ios: [
    'Apri la pagina con Safari.',
    'Tocca il tasto Condividi, il quadrato con la freccia in su.',
    'Scorri e scegli “Aggiungi alla schermata Home”.',
    'Conferma con “Aggiungi”.',
  ],
  android: [
    'Apri la pagina con Chrome.',
    'Tocca il menu ⋮ in alto a destra.',
    'Scegli “Installa app” (o “Aggiungi a schermata Home”).',
    'Conferma con “Installa”.',
  ],
  desktop: [
    'Apri la pagina con Chrome o Edge.',
    'Clicca l’icona di installazione a destra nella barra degli indirizzi, oppure menu ⋮ → “Installa Adventures”.',
    'Su Safari per Mac: menu File → “Aggiungi al Dock”.',
  ],
}

/**
 * La pagina "Installa l'app": ci si arriva dal menu quando il browser non può
 * installare con un tocco (installazione.ts).
 */
export function Installa({ stato }: { stato: StatoInstallazione }) {
  const riquadro = 'flex flex-col gap-2.5 rounded-[11px] border border-bordo bg-white p-4'

  if (stato === 'installata') {
    return (
      <section className={riquadro}>
        <h2 className="text-lg font-semibold">L'app è installata</h2>
        <p className="text-testo-tenue">Aprila dalla schermata Home: parte a schermo intero, come un'app.</p>
      </section>
    )
  }

  const passi = istruzioni[piattaforma(navigator.userAgent, navigator.maxTouchPoints)]
  return (
    <section className={riquadro}>
      <h2 className="text-lg font-semibold">Mettila sulla schermata Home</h2>
      <p className="text-testo-tenue">
        Installata si apre a schermo intero, come un'app. Per vedere e salvare trekking e avventure serve comunque la rete.
      </p>
      <ol className="flex list-decimal flex-col gap-1.5 pl-5">
        {passi.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
    </section>
  )
}
