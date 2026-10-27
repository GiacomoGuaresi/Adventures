import { Compass, Flag, Flame, Footprints, Leaf, MountainSnow, Rocket, Snowflake, Stamp, Star, type LucideIcon } from 'lucide-react'
import type { IconaTraguardo } from '../../dominio/traguardi'

/** Le icone dei traguardi: nel sigillo del passaporto e nell'elenco di quelli da sbloccare. */
export const ICONE_TRAGUARDI: Record<IconaTraguardo, LucideIcon> = {
  bandiera: Flag,
  vetta: MountainSnow,
  neve: Snowflake,
  scarpone: Footprints,
  stella: Star,
  razzo: Rocket,
  timbro: Stamp,
  bussola: Compass,
  foglia: Leaf,
  fiamma: Flame,
}
