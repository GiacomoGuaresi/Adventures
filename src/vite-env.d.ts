/// <reference types="vite/client" />
// I gruppi di segnaposto della mappa (Mappa.tsx, react-leaflet-cluster).
/// <reference types="leaflet.markercluster" />

// Le variabili d'ambiente dell'app: vedi .env.example.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_SUPABASE_EMAIL?: string
  readonly VITE_OPENROUTESERVICE_KEY?: string
}
