import type { ThreeEvent } from '@react-three/fiber'
import type * as THREE from 'three'

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

/** A round obstacle the cat can't walk through. */
export interface Collider {
  x: number
  z: number
  r: number
}

export interface SceneProps {
  /** Live cat position, so toys can react to it. */
  cat?: React.RefObject<THREE.Vector3>
  /** Called when the player clicks somewhere on the floor. */
  onFloorClick?: (e: ThreeEvent<PointerEvent>) => void
}

export interface PlaceWorld {
  bounds: Bounds
  colliders: Collider[]
  spawn: { x: number; z: number; heading: number }
  background: string
  fog: [near: number, far: number]
  /** Keep the follow-camera inside walls (indoor places). */
  clampCamera: boolean
  Scene: (props: SceneProps) => React.JSX.Element
}
