import { useCallback, useRef } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Cat } from '../components/Cat'
import type { PlaceWorld } from '../places/types'
import type { Breed } from '../types'
import { Player } from './Player'

/**
 * Menu background: the chosen cat idling in a place while the camera slowly circles.
 * `framing` shifts where the cat appears so the menu card doesn't cover it.
 */
function Showcase({ world, breed, framing }: { world: PlaceWorld; breed?: Breed; framing: Framing }) {
  const { x, z } = world.spawn
  const look = useRef(new THREE.Vector3())
  useFrame(({ camera, clock, size }) => {
    const a = clock.elapsedTime * 0.12
    camera.position.set(x + Math.sin(a) * 3.4, 1.7, z + Math.cos(a) * 3.4)
    // Camera's right-hand vector; aiming left of the cat puts the cat on the right of the screen.
    const wide = size.width > 800
    const side = framing === 'right' && wide ? 1.1 : 0
    const drop = framing === 'top' ? 0.55 : 0
    look.current.set(x - Math.cos(a) * side, 0.6 - drop, z + Math.sin(a) * side)
    camera.lookAt(look.current)
  })
  return (
    <>
      <world.Scene />
      {breed && (
        <group position={[x, 0, z]} rotation={[0, 0.6, 0]}>
          <Cat breed={breed} />
        </group>
      )}
    </>
  )
}

function Play({ world, breed, name }: { world: PlaceWorld; breed: Breed; name: string }) {
  const position = useRef(new THREE.Vector3(world.spawn.x, 0, world.spawn.z))
  const target = useRef<THREE.Vector3 | null>(null)
  const onFloorClick = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    target.current = e.point.clone()
  }, [])
  return (
    <>
      <world.Scene cat={position} onFloorClick={onFloorClick} />
      <Player breed={breed} name={name} world={world} position={position} target={target} />
    </>
  )
}

export type Framing = 'center' | 'right' | 'top'

export function Stage({
  placeId, world, breed, name, playing, framing = 'center',
}: { placeId: string; world: PlaceWorld; breed?: Breed; name: string; playing: boolean; framing?: Framing }) {
  return (
    <Canvas
      className="stage"
      shadows
      dpr={[1, 2]}
      camera={{ fov: 55, near: 0.1, far: 120, position: [0, 2, -4] }}
    >
      <color attach="background" args={[world.background]} />
      <fog attach="fog" args={[world.background, ...world.fog]} />
      {playing && breed ? (
        <Play key={placeId} world={world} breed={breed} name={name} />
      ) : (
        <Showcase world={world} breed={breed} framing={framing} />
      )}
    </Canvas>
  )
}
