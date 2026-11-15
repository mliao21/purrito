import { garden } from './Garden'
import { livingRoom } from './LivingRoom'
import type { PlaceWorld } from './types'

/** 3D worlds keyed by the place id from the API. Places without a world show as "coming soon". */
export const worlds: Record<string, PlaceWorld> = {
  'living-room': livingRoom,
  garden,
}
