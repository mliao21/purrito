import {
  Armchair, Bookshelf, CatBed, CatTree, CoffeeTable, FloorLamp, PottedPlant, Rug, Soft, Sofa, WallWindow, YarnBall,
} from '../components/props'
import type { PlaceWorld, SceneProps } from './types'

const HALF = 6 // room is 12 x 12
const WALL_H = 3.4

const bounds = { minX: -HALF + 0.4, maxX: HALF - 0.4, minZ: -HALF + 0.4, maxZ: HALF - 0.4 }

function Scene({ cat, onFloorClick }: SceneProps) {
  return (
    <>
      <hemisphereLight args={['#fff4ea', '#e8d6f0', 1.3]} />
      <directionalLight
        position={[-5, 8, 3]}
        intensity={1.6}
        color="#fff0dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      {/* Floor (wood) — clickable for click-to-walk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={onFloorClick}>
        <planeGeometry args={[HALF * 2, HALF * 2]} />
        <Soft color="#f1d9c0" />
      </mesh>
      {Array.from({ length: 11 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-HALF + (i + 1), 0.002, 0]}>
          <planeGeometry args={[0.02, HALF * 2]} />
          <Soft color="#e7cbb0" />
        </mesh>
      ))}

      {/* Walls */}
      {[
        { pos: [0, WALL_H / 2, HALF] as const, rot: Math.PI, color: '#fbe1e8' },
        { pos: [0, WALL_H / 2, -HALF] as const, rot: 0, color: '#fbe1e8' },
        { pos: [HALF, WALL_H / 2, 0] as const, rot: -Math.PI / 2, color: '#e7def6' },
        { pos: [-HALF, WALL_H / 2, 0] as const, rot: Math.PI / 2, color: '#e7def6' },
      ].map((w, i) => (
        <group key={i} position={[...w.pos]} rotation={[0, w.rot, 0]}>
          <mesh receiveShadow>
            <planeGeometry args={[HALF * 2, WALL_H]} />
            <Soft color={w.color} />
          </mesh>
          {/* baseboard */}
          <mesh position={[0, -WALL_H / 2 + 0.08, 0.03]}>
            <boxGeometry args={[HALF * 2, 0.16, 0.06]} />
            <Soft color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Windows on the left wall, with warm light streaming in */}
      <WallWindow position={[-HALF + 0.01, 1.9, -1.5]} rotation={[0, Math.PI / 2, 0]} />
      <WallWindow position={[-HALF + 0.01, 1.9, 1.8]} rotation={[0, Math.PI / 2, 0]} />
      {/* Framed pictures */}
      {[
        [-1.2, '#cfe6f7'],
        [1.2, '#c8ecd9'],
      ].map(([x, c]) => (
        <group key={x as number} position={[x as number, 2.3, HALF - 0.03]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.7, 0.05]} />
            <Soft color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[0.72, 0.52]} />
            <Soft color={c as string} />
          </mesh>
        </group>
      ))}

      <Rug position={[0, 0, 2.2]} />
      <Sofa position={[0, 0, HALF - 0.65]} rotation={[0, Math.PI, 0]} />
      <CoffeeTable position={[0, 0, 2.6]} />
      <Armchair position={[-3.8, 0, 2.4]} rotation={[0, Math.PI / 2 + 0.4, 0]} />
      <Bookshelf position={[HALF - 0.3, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <PottedPlant position={[HALF - 0.7, 0, HALF - 0.7]} />
      <PottedPlant position={[-HALF + 0.7, 0, HALF - 0.7]} pot="#cfe6f7" />
      <FloorLamp position={[2.4, 0, HALF - 0.6]} />
      <CatTree position={[-4.4, 0, -3.8]} />
      <CatBed position={[3.6, 0, -3.6]} />
      <Rug position={[3.6, 0, -3.6]} radius={1.1} color="#d9ccf2" />

      <YarnBall start={[1.6, 0.4]} cat={cat} bounds={bounds} />
      <YarnBall start={[-1.8, -1.2]} color="#cfe6f7" cat={cat} bounds={bounds} />
    </>
  )
}

export const livingRoom: PlaceWorld = {
  bounds,
  colliders: [
    // sofa
    { x: -0.9, z: HALF - 0.6, r: 0.65 },
    { x: 0, z: HALF - 0.6, r: 0.65 },
    { x: 0.9, z: HALF - 0.6, r: 0.65 },
    { x: 0, z: 2.6, r: 0.75 }, // coffee table
    { x: -3.8, z: 2.4, r: 0.8 }, // armchair
    // bookshelf
    { x: HALF - 0.3, z: -0.7, r: 0.5 },
    { x: HALF - 0.3, z: 0, r: 0.5 },
    { x: HALF - 0.3, z: 0.7, r: 0.5 },
    { x: HALF - 0.7, z: HALF - 0.7, r: 0.45 },
    { x: -HALF + 0.7, z: HALF - 0.7, r: 0.45 },
    { x: 2.4, z: HALF - 0.6, r: 0.35 }, // lamp
    { x: -4.4, z: -3.8, r: 0.65 }, // cat tree
  ],
  spawn: { x: 0, z: -1.5, heading: 0 },
  background: '#f6e7ea',
  fog: [14, 30],
  clampCamera: true,
  Scene,
}
