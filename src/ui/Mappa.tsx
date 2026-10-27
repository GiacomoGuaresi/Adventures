import { createElement, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { LayersControl, MapContainer, Marker, Popup, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import { divIcon, type DivIcon, type LatLngBoundsExpression } from 'leaflet'
import { Check, House, Info, MountainSnow, Tent, type LucideIcon } from 'lucide-react'
import type { Coordinate } from '../dominio/coordinate'
import { distanzaDaCasa, formattaDistanza } from '../dominio/distanza'
import { formattaDurata } from '../dominio/durata'
import type { Attivita, Tipo } from '../dominio/tipi'
import { formattaViaggio } from '../dominio/viaggio'
import 'leaflet/dist/leaflet.css'

interface Props {
  /** Trekking e avventure già filtrati: chi non ha le coordinate non compare. */
  attivita: readonly Attivita[]
  casa: Coordinate | null
  /** Il pulsante "Dettagli" del popup apre la scheda in sola lettura. */
  onDettagli: (attivita: Attivita) => void
}

const PANNA = '#fbf8f1'

/**
 * I colori dei segnaposto: blu montagna per i trekking, terracotta per le
 * avventure, così sulla mappa comune si distinguono; i completati sono chiari.
 */
const COLORI: Record<Tipo, { bordo: string; pieno: string; completato: string }> = {
  trekking: { bordo: '#32516c', pieno: '#5b87ad', completato: '#dbe7f1' },
  avventura: { bordo: '#8a4a22', pieno: '#c9793f', completato: '#f1ddcc' },
}

/** Le stesse icone delle voci del menu. */
const ICONE: Record<Tipo, LucideIcon> = { trekking: MountainSnow, avventura: Tent }

/**
 * Il segnaposto a goccia con l'icona del tipo: pieno per quelli da fare,
 * chiaro e con la spunta per i completati. Serve sia ai segnaposto di Leaflet
 * (come HTML) sia alla legenda.
 */
function Goccia({ tipo, completato }: { tipo: Tipo; completato: boolean }) {
  const c = COLORI[tipo]
  return (
    <span className="segnaposto">
      <span
        className="segnaposto-goccia"
        style={{ background: completato ? c.completato : c.pieno, borderColor: completato ? c.bordo : PANNA }}
      />
      {createElement(ICONE[tipo], {
        className: 'segnaposto-icona',
        size: 12,
        strokeWidth: 2.3,
        color: completato ? c.bordo : PANNA,
        'aria-hidden': true,
      })}
      {completato && (
        <span className="segnaposto-fatto" style={{ background: c.bordo }}>
          <Check size={7} strokeWidth={4} color={PANNA} aria-hidden="true" />
        </span>
      )}
    </span>
  )
}

/** Casa: un tondo panna con la casetta, un po' più grande dei segnaposto. */
function Casa() {
  return (
    <span className="segnaposto-casa">
      <House size={14} strokeWidth={2.3} color="#32516c" aria-hidden="true" />
    </span>
  )
}

/** L'HTML di un pezzo di React, per i `divIcon` di Leaflet. */
function html(nodo: ReactNode): string {
  const contenitore = document.createElement('div')
  const radice = createRoot(contenitore)
  flushSync(() => radice.render(nodo))
  const fatto = contenitore.innerHTML
  radice.unmount()
  return fatto
}

/** Le icone per Leaflet, fatte una volta sola: la punta della goccia sta sul punto. */
function icona(html: string): DivIcon {
  return divIcon({ className: '', html, iconSize: [22, 27], iconAnchor: [11, 26], popupAnchor: [0, -25], tooltipAnchor: [0, 1] })
}

const ICONE_SEGNAPOSTO: Record<Tipo, Record<'da_fare' | 'fatto', DivIcon>> = {
  trekking: {
    da_fare: icona(html(<Goccia tipo="trekking" completato={false} />)),
    fatto: icona(html(<Goccia tipo="trekking" completato />)),
  },
  avventura: {
    da_fare: icona(html(<Goccia tipo="avventura" completato={false} />)),
    fatto: icona(html(<Goccia tipo="avventura" completato />)),
  },
}

const ICONA_CASA = divIcon({
  className: '',
  html: html(<Casa />),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

/** Da questo zoom in su il nome sta sotto ogni segnaposto. */
const ZOOM_ETICHETTE = 13

/**
 * L'inquadratura all'apertura: il nord Italia e il sud della Svizzera, dal
 * Monviso al Friuli e dall'Appennino al Vallese. Resta fissa anche quando i
 * filtri cambiano i segnaposto.
 */
const NORD_ITALIA: LatLngBoundsExpression = [
  [44.1, 6.6],
  [46.7, 13.8],
]

/** Quanto spazio lascia in alto la barra flottante di ricerca e filtri. */
const SOTTO_LA_BARRA = 80

/**
 * La mappa (docs/02-funzionalita.md): un segnaposto con l'icona per ogni
 * trekking e per ogni avventura con le coordinate, di colore diverso, con un
 * popup riassuntivo e il pulsante per aprire i dettagli; da vicino il nome sta
 * sotto il segnaposto. Chi non ha il luogo resta nell'elenco ma non compare
 * qui. Casa ha la sua icona; lo sfondo è CARTO Voyager, più calmo di
 * OpenStreetMap, e si può passare a OpenStreetMap o a OpenTopoMap per vedere
 * curve di livello e sentieri.
 *
 * Riempie tutto il contenitore: sopra, in alto, galleggia la barra con ricerca
 * e filtri, quindi i comandi di Leaflet stanno in basso a destra, la legenda in
 * basso a sinistra, e inquadratura e popup lasciano libera la fascia in alto.
 */
export function Mappa({ attivita, casa, onDettagli }: Props) {
  const conLuogo = attivita.filter((t) => t.lat !== null && t.lon !== null)

  return (
    <div className="relative size-full">
      <MapContainer
        bounds={NORD_ITALIA}
        boundsOptions={{ paddingTopLeft: [16, SOTTO_LA_BARRA], paddingBottomRight: [16, 16] }}
        scrollWheelZoom
        zoomControl={false}
        className="size-full"
      >
        <ZoomControl position="bottomright" />
        <LayersControl position="bottomright">
          <LayersControl.BaseLayer checked name="Mappa">
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Sentieri">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, tessere di <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        {casa !== null && (
          <Marker position={[casa.lat, casa.lon]} icon={ICONA_CASA} title="Casa" alt="Casa" zIndexOffset={2000} />
        )}
        <Segnaposti attivita={conLuogo} casa={casa} onDettagli={onDettagli} />
      </MapContainer>
      <Legenda casa={casa !== null} />
      {conLuogo.length === 0 && (
        <p className="sr-only" role="status">
          Niente con le coordinate.
        </p>
      )}
    </div>
  )
}

/** I segnaposto, col nome sotto quando lo zoom è abbastanza vicino. */
function Segnaposti({ attivita, casa, onDettagli }: Props) {
  const mappa = useMap()
  const [zoom, setZoom] = useState(() => mappa.getZoom())
  useMapEvents({ zoomend: () => setZoom(mappa.getZoom()) })
  const etichette = zoom >= ZOOM_ETICHETTE

  return attivita.map((t) => (
    <Marker
      key={t.id}
      position={[t.lat as number, t.lon as number]}
      icon={ICONE_SEGNAPOSTO[t.tipo][t.completato ? 'fatto' : 'da_fare']}
      title={t.nome}
      alt={t.nome}
      // Quelli da fare stanno sopra i completati.
      zIndexOffset={t.completato ? 0 : 1000}
    >
      {etichette && (
        <Tooltip permanent direction="bottom" className="etichetta-mappa">
          {t.nome}
        </Tooltip>
      )}
      <Popup autoPanPaddingTopLeft={[16, SOTTO_LA_BARRA]}>
        <Anteprima attivita={t} casa={casa} onDettagli={onDettagli} />
      </Popup>
    </Marker>
  ))
}

/** La legenda in basso a sinistra: piccola, e non ferma i tocchi sulla mappa. */
function Legenda({ casa }: { casa: boolean }) {
  const voci: [ReactNode, string][] = [
    [<Goccia tipo="trekking" completato={false} />, 'Trekking'],
    [<Goccia tipo="avventura" completato={false} />, 'Avventura'],
    [<Goccia tipo="trekking" completato />, 'Completato'],
  ]
  if (casa) voci.push([<Casa />, 'Casa'])
  return (
    <ul
      className="pointer-events-none absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-2 z-[1000] m-0 grid list-none gap-1 rounded-xl bg-panna/90 p-2 pr-3 text-xs font-medium text-testo shadow-[0_1px_4px_rgb(37_50_62/0.25)]"
      aria-label="Legenda"
    >
      {voci.map(([segno, etichetta]) => (
        <li key={etichetta} className="flex items-center gap-2">
          <span className="legenda-segno" aria-hidden="true">
            {segno}
          </span>
          {etichetta}
        </li>
      ))}
    </ul>
  )
}

/** Il popup: nome e numeri, con il pulsante che apre i dettagli. */
function Anteprima({ attivita: t, casa, onDettagli }: { attivita: Attivita; casa: Coordinate | null; onDettagli: (t: Attivita) => void }) {
  const righe = [
    ...(t.tipo === 'trekking'
      ? [
          ['Dislivello', t.dislivello === null ? '—' : `${t.dislivello} m`],
          ['Durata', formattaDurata(t.durata_ore)],
        ]
      : []),
    ['Viaggio', formattaViaggio(t.viaggio_minuti)],
    ...(casa === null ? [] : [['Da casa', formattaDistanza(distanzaDaCasa(t, casa))]]),
  ]

  return (
    <div className="min-w-[180px] font-sans text-testo">
      <strong className="text-sm">{t.nome}</strong>
      {t.luogo_nome && <div className="text-xs text-testo-tenue">{t.luogo_nome}</div>}
      <dl className="my-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        {righe.map(([etichetta, valore]) => (
          <Fragmento key={etichetta} etichetta={etichetta} valore={valore} />
        ))}
      </dl>
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[11px] bg-montagna px-3 font-semibold text-panna hover:bg-montagna-scura"
        onClick={() => onDettagli(t)}
      >
        <Info className="size-[17px]" aria-hidden="true" />
        Dettagli
      </button>
    </div>
  )
}

function Fragmento({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <>
      <dt className="m-0 text-testo-tenue">{etichetta}</dt>
      <dd className="m-0">{valore}</dd>
    </>
  )
}
