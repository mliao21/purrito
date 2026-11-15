import { useMemo } from 'react'
import { Bench, Bush, Butterfly, FenceLine, Flower, Pond, Soft, Tree, YarnBall } from '../components/props'
import type { PlaceWorld, SceneProps } from './types'

const HALF = 9
const bounds = { minX: -HALF + 0.5, maxX: HALF - 0.5, minZ: -HALF + 0.5, maxZ: HALF - 0.5 }
const FLOWER_COLORS = ['#f8c8dc', '#d9ccf2', '#ffe3a8', '#fbd3c4', '#cfe6f7']

// Deterministic pseudo-random so the flower beds look the same every visit.
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

function Scene({ cat, onFloorClick }: SceneProps) {
  const flowers = useMemo(() => {
    const list: { x: number; z: number; color: string }[] = []
    // beds along the back and side fences
    for (let i = 0; i < 70; i++) {
      const edge = i % 3
      const t = rand(i) * (HALF * 2 - 2) - (HALF - 1)
      const inset = 0.5 + rand(i + 100) * 0.9
      const x = edge === 0 ? t : edge === 1 ? HALF - inset : -HALF + inset
      const z = edge === 0 ? HALF - inset : t
      list.push({ x, z, color: FLOWER_COLORS[i % FLOWER_COLORS.length] })
    }
    // a few wildflowers in the lawn
    for (let i = 0; i < 25; i++) {
      const x = rand(i + 300) * 14 - 7
      const z = rand(i + 400) * 10 - 7
      if (Math.hypot(x - 3.2, z - 2.5) < 2.2) continue // keep out of the pond
      list.push({ x, z, color: FLOWER_COLORS[(i + 2) % FLOWER_COLORS.length] })
    }
    return list
  }, [])

  return (
    <>
      <hemisphereLight args={['#fff8ee', '#cfe8c4', 1.4]} />
      <directionalLight
        position={[6, 10, -4]}
        intensity={1.8}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0005}
      />

      {/* Lawn — clickable for click-to-walk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={onFloorClick}>
        <circleGeometry args={[40, 64]} />
        <Soft color="#cfe9b8" />
      </mesh>
      {/* Stepping-stone path */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.6) * 0.8, 0.02, -7 + i * 1.1]} scale={[1, 0.15, 0.8]} receiveShadow>
          <sphereGeometry args={[0.35, 16, 8]} />
          <Soft color="#f1e8df" />
        </mesh>
      ))}

      <FenceLine from={[-HALF, HALF]} to={[HALF, HALF]} />
      <FenceLine from={[HALF, HALF]} to={[HALF, -HALF]} />
      <FenceLine from={[HALF, -HALF]} to={[-HALF, -HALF]} />
      <FenceLine from={[-HALF, -HALF]} to={[-HALF, HALF]} />

      <Tree position={[-6, 0, 5]} />
      <Tree position={[6.5, 0, 6]} crown="#c8ecd9" scale={1.15} />
      <Tree position={[-6.5, 0, -5.5]} crown="#c8ecd9" scale={0.9} />
      <Tree position={[6.8, 0, -4]} />
      {/* a blossom tree */}
      <Tree position={[-1.5, 0, 6.8]} crown="#f8c8dc" scale={1.05} />

      <Bush position={[2.5, 0, 7.4]} />
      <Bush position={[-3.8, 0, 7.6]} flowers="#ffe3a8" />
      <Bush position={[7.6, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} flowers="#d9ccf2" />
      <Bush position={[-7.6, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]} />

      <Pond position={[3.2, 0, 2.5]} />
      <Bench position={[-4, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} />

      {flowers.map((f, i) => (
        <Flower key={i} position={[f.x, 0, f.z]} color={f.color} scale={0.9 + rand(i + 900) * 0.5} />
      ))}

      <Butterfly color="#f8c8dc" center={[0, 1.2, 2]} radius={3} speed={0.35} seed={0} />
      <Butterfly color="#d9ccf2" center={[3, 1, -2]} radius={2.2} speed={0.45} seed={2} />
      <Butterfly color="#ffe3a8" center={[-3, 1.4, 4]} radius={2.5} speed={0.3} seed={4} />

      <YarnBall start={[1.2, -2]} color="#ffe3a8" radius={0.18} cat={cat} bounds={bounds} />
    </>
  )
}

export const garden: PlaceWorld = {
  bounds,
  colliders: [
    { x: -6, z: 5, r: 0.45 },
    { x: 6.5, z: 6, r: 0.5 },
    { x: -6.5, z: -5.5, r: 0.4 },
    { x: 6.8, z: -4, r: 0.45 },
    { x: -1.5, z: 6.8, r: 0.45 },
    { x: 2.5, z: 7.4, r: 0.8 },
    { x: -3.8, z: 7.6, r: 0.8 },
    { x: 7.6, z: 1.5, r: 0.8 },
    { x: -7.6, z: 0.5, r: 0.8 },
    { x: 3.2, z: 2.5, r: 1.75 }, // pond
    { x: -4, z: 0.9, r: 0.45 }, // bench
    { x: -4, z: 2.1, r: 0.45 },
  ],
  spawn: { x: 0, z: -4, heading: 0 },
  background: '#d6ecfa',
  fog: [18, 45],
  clampCamera: false,
  Scene,
}
