import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { Bounds } from '../places/types'

type V3 = [number, number, number]
interface Placed {
  position?: V3
  rotation?: V3
  scale?: number
}

export function Soft({ color, emissive, opacity = 1 }: { color: string; emissive?: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.9}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? 0.6 : 0}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

/** A rounded box resting on the ground: `y` is its bottom, not its centre. */
function Block({ size, color, at = [0, 0, 0], radius = 0.08 }: { size: V3; color: string; at?: V3; radius?: number }) {
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, Math.min(...size) / 2 - 0.001)}
      smoothness={4}
      position={[at[0], at[1] + size[1] / 2, at[2]]}
      castShadow
      receiveShadow
    >
      <Soft color={color} />
    </RoundedBox>
  )
}

// ───────────────────────────── Indoor ─────────────────────────────

export function Sofa({ color = '#c9b8ea', cushion = '#ddd1f3', ...p }: Placed & { color?: string; cushion?: string }) {
  return (
    <group {...p}>
      <Block size={[2.6, 0.45, 1.0]} color={color} at={[0, 0.1, 0]} radius={0.15} />
      <Block size={[2.6, 0.75, 0.3]} color={color} at={[0, 0.4, -0.38]} radius={0.15} />
      <Block size={[0.3, 0.5, 1.0]} color={color} at={[1.2, 0.4, 0]} radius={0.14} />
      <Block size={[0.3, 0.5, 1.0]} color={color} at={[-1.2, 0.4, 0]} radius={0.14} />
      <Block size={[1.0, 0.16, 0.7]} color={cushion} at={[-0.5, 0.55, 0.08]} radius={0.07} />
      <Block size={[1.0, 0.16, 0.7]} color={cushion} at={[0.5, 0.55, 0.08]} radius={0.07} />
      <Block size={[0.45, 0.4, 0.14]} color="#f8c8dc" at={[-0.75, 0.68, -0.18]} radius={0.06} />
      {[-1.15, 1.15].map((x) => (
        <Block key={x} size={[0.12, 0.1, 0.12]} color="#b89a86" at={[x, 0, 0.38]} radius={0.03} />
      ))}
    </group>
  )
}

export function Armchair({ color = '#bfe3d0', ...p }: Placed & { color?: string }) {
  return (
    <group {...p}>
      <Block size={[1.2, 0.45, 1.0]} color={color} at={[0, 0.1, 0]} radius={0.15} />
      <Block size={[1.2, 0.7, 0.28]} color={color} at={[0, 0.4, -0.38]} radius={0.13} />
      <Block size={[0.26, 0.42, 1.0]} color={color} at={[0.5, 0.4, 0]} radius={0.12} />
      <Block size={[0.26, 0.42, 1.0]} color={color} at={[-0.5, 0.4, 0]} radius={0.12} />
    </group>
  )
}

export function Rug({ color = '#fbd3c4', radius = 1.8, ...p }: Placed & { color?: string; radius?: number }) {
  return (
    <group {...p}>
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius, 0.02, 48]} />
        <Soft color={color} />
      </mesh>
      <mesh position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[radius * 0.62, radius * 0.7, 48]} />
        <Soft color="#fff3ea" />
      </mesh>
    </group>
  )
}

export function CoffeeTable(p: Placed) {
  return (
    <group {...p}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.7, 0.7, 0.08, 40]} />
        <Soft color="#e9cfb5" />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.45, 0.21, Math.sin(a) * 0.45]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.42, 10]} />
            <Soft color="#c9a98e" />
          </mesh>
        )
      })}
      {/* A mug and a little plant on the table */}
      <mesh position={[0.25, 0.56, 0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.06, 0.14, 16]} />
        <Soft color="#cfe6f7" />
      </mesh>
      <mesh position={[-0.2, 0.55, -0.15]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 16]} />
        <Soft color="#f6c9a8" />
      </mesh>
      <mesh position={[-0.2, 0.67, -0.15]} castShadow>
        <sphereGeometry args={[0.1, 14, 10]} />
        <Soft color="#a9d8a0" />
      </mesh>
    </group>
  )
}

export function PottedPlant({ pot = '#f6c9a8', ...p }: Placed & { pot?: string }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2
        return { pos: [Math.cos(a) * 0.22, 0.85 + (i % 3) * 0.12, Math.sin(a) * 0.22] as V3, r: 0.2 + (i % 2) * 0.05 }
      }),
    [],
  )
  return (
    <group {...p}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.24, 0.5, 24]} />
        <Soft color={pot} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 0.4, 8]} />
        <Soft color="#8fbf86" />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={l.pos} castShadow>
          <sphereGeometry args={[l.r, 14, 10]} />
          <Soft color={i % 2 ? '#a9d8a0' : '#9ccf98'} />
        </mesh>
      ))}
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.24, 14, 10]} />
        <Soft color="#b5dfab" />
      </mesh>
    </group>
  )
}

export function Bookshelf(p: Placed) {
  const books = ['#f8c8dc', '#cfe6f7', '#d9ccf2', '#c8ecd9', '#ffe3a8', '#fbd3c4']
  return (
    <group {...p}>
      <Block size={[2, 2.2, 0.5]} color="#f1dcc6" radius={0.05} />
      {[0.55, 1.15, 1.75].map((y, row) => (
        <group key={y}>
          <mesh position={[0, y - 0.05, 0.05]}>
            <boxGeometry args={[1.85, 0.5, 0.42]} />
            <Soft color="#e3c6a9" />
          </mesh>
          {books.slice(row, row + 4).map((color, i) => (
            <Block key={i} size={[0.14, 0.34 + ((i + row) % 3) * 0.05, 0.3]} color={color} at={[-0.7 + i * 0.18, y - 0.29, 0.12]} radius={0.02} />
          ))}
        </group>
      ))}
    </group>
  )
}

export function CatBed({ color = '#f8c8dc', ...p }: Placed & { color?: string }) {
  return (
    <group {...p}>
      <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.55, 0.16, 16, 40]} />
        <Soft color={color} />
      </mesh>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.58, 0.58, 0.08, 32]} />
        <Soft color="#fff3ea" />
      </mesh>
    </group>
  )
}

export function CatTree(p: Placed) {
  return (
    <group {...p}>
      <Block size={[1.1, 0.12, 1.1]} color="#e9d5c0" radius={0.05} />
      {[
        [0, 1.1],
        [0.3, 1.9],
      ].map(([x, h], i) => (
        <mesh key={i} position={[x, h / 2, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, h, 14]} />
          <Soft color="#f3e6d4" />
        </mesh>
      ))}
      <mesh position={[-0.05, 1.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 28]} />
        <Soft color="#d9ccf2" />
      </mesh>
      <mesh position={[0.3, 1.92, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 28]} />
        <Soft color="#cfe6f7" />
      </mesh>
      {/* Dangling toy */}
      <mesh position={[-0.4, 0.85, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.45, 4]} />
        <Soft color="#a08f9b" />
      </mesh>
      <mesh position={[-0.4, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.06, 12, 10]} />
        <Soft color="#f8c8dc" />
      </mesh>
    </group>
  )
}

export function FloorLamp(p: Placed) {
  return (
    <group {...p}>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.25, 0.28, 0.06, 24]} />
        <Soft color="#e6d6c8" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.7, 8]} />
        <Soft color="#d8c5b5" />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.38, 0.4, 24, 1, true]} />
        <Soft color="#fff1c9" emissive="#ffe2a0" />
      </mesh>
      <pointLight position={[0, 1.65, 0]} intensity={2.5} distance={5} color="#ffd9a0" />
    </group>
  )
}

export function WallWindow(p: Placed) {
  return (
    <group {...p}>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[1.6, 1.4]} />
        <Soft color="#d8efff" emissive="#cfeaff" />
      </mesh>
      {/* frame + cross bars */}
      {[
        [0, 0.72, 1.72, 0.1],
        [0, -0.72, 1.72, 0.1],
        [0.82, 0, 0.1, 1.5],
        [-0.82, 0, 0.1, 1.5],
        [0, 0, 1.6, 0.06],
        [0, 0, 0.06, 1.4],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.05]}>
          <boxGeometry args={[w, h, 0.08]} />
          <Soft color="#ffffff" />
        </mesh>
      ))}
      {/* sill */}
      <mesh position={[0, -0.8, 0.15]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.32]} />
        <Soft color="#ffffff" />
      </mesh>
    </group>
  )
}

// ───────────────────────────── Outdoor ─────────────────────────────

export function Tree({ crown = '#b5dfab', ...p }: Placed & { crown?: string }) {
  return (
    <group {...p}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 1.8, 12]} />
        <Soft color="#c9a98e" />
      </mesh>
      {[
        [0, 2.3, 0, 1.0],
        [0.55, 2.0, 0.2, 0.7],
        [-0.5, 2.05, -0.15, 0.72],
        [0.1, 2.9, -0.1, 0.7],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 18, 14]} />
          <Soft color={i % 2 ? crown : '#a9d8a0'} />
        </mesh>
      ))}
    </group>
  )
}

export function Bush({ color = '#a9d8a0', flowers = '#f8c8dc', ...p }: Placed & { color?: string; flowers?: string }) {
  return (
    <group {...p}>
      {[
        [0, 0.4, 0, 0.55],
        [0.45, 0.32, 0.1, 0.4],
        [-0.42, 0.3, 0.05, 0.42],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[r, 16, 12]} />
          <Soft color={color} />
        </mesh>
      ))}
      {[
        [0.1, 0.9, 0.25],
        [-0.3, 0.65, 0.35],
        [0.5, 0.6, 0.35],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <Soft color={flowers} />
        </mesh>
      ))}
    </group>
  )
}

export function Flower({ color = '#f8c8dc', ...p }: Placed & { color?: string }) {
  return (
    <group {...p}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 5]} />
        <Soft color="#8fbf86" />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 0.06, 0.31, Math.sin(a) * 0.06]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <Soft color={color} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <Soft color="#ffe3a8" />
      </mesh>
    </group>
  )
}

export function FenceLine({ from, to, color = '#fff6ec' }: { from: [number, number]; to: [number, number]; color?: string }) {
  const posts = useMemo(() => {
    const [x1, z1] = from
    const [x2, z2] = to
    const len = Math.hypot(x2 - x1, z2 - z1)
    const n = Math.max(2, Math.round(len / 0.6))
    return Array.from({ length: n + 1 }, (_, i) => [x1 + ((x2 - x1) * i) / n, z1 + ((z2 - z1) * i) / n] as [number, number])
  }, [from, to])
  const [x1, z1] = from
  const [x2, z2] = to
  const len = Math.hypot(x2 - x1, z2 - z1)
  const angle = Math.atan2(x2 - x1, z2 - z1)
  return (
    <group>
      {posts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.14, 0.9, 0.08]} />
            <Soft color={color} />
          </mesh>
          <mesh position={[0, 0.92, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.1, 0.08]} />
            <Soft color={color} />
          </mesh>
        </group>
      ))}
      {[0.35, 0.7].map((y) => (
        <mesh key={y} position={[(x1 + x2) / 2, y, (z1 + z2) / 2]} rotation={[0, angle, 0]} castShadow>
          <boxGeometry args={[0.04, 0.08, len]} />
          <Soft color={color} />
        </mesh>
      ))}
    </group>
  )
}

export function Pond({ radius = 1.6, ...p }: Placed & { radius?: number }) {
  const water = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    water.current.position.y = 0.04 + Math.sin(clock.elapsedTime * 1.5) * 0.005
  })
  const stones = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2
        return [Math.cos(a) * (radius + 0.12), Math.sin(a) * (radius + 0.12), 0.16 + (i % 3) * 0.04] as V3
      }),
    [radius],
  )
  return (
    <group {...p}>
      <mesh ref={water} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[radius, 40]} />
        <meshStandardMaterial color="#a8d8f0" roughness={0.2} metalness={0.1} />
      </mesh>
      {stones.map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.05, z]} scale={[1, 0.5, 1]} castShadow>
          <sphereGeometry args={[r, 10, 8]} />
          <Soft color={i % 2 ? '#e3dcd6' : '#d6cdc6'} />
        </mesh>
      ))}
      {/* Lily pads */}
      {[
        [0.5, 0.3],
        [-0.6, -0.4],
        [0.1, -0.8],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.06, z]} rotation={[-Math.PI / 2, 0, i]}>
          <circleGeometry args={[0.2, 16, 0.4, Math.PI * 1.8]} />
          <Soft color="#9ccf98" />
        </mesh>
      ))}
    </group>
  )
}

export function Bench(p: Placed) {
  return (
    <group {...p}>
      <Block size={[1.8, 0.1, 0.55]} color="#f1dcc6" at={[0, 0.45, 0]} radius={0.04} />
      <Block size={[1.8, 0.45, 0.08]} color="#f1dcc6" at={[0, 0.6, -0.25]} radius={0.04} />
      {[-0.75, 0.75].map((x) => (
        <Block key={x} size={[0.1, 0.45, 0.5]} color="#c9a98e" at={[x, 0, 0]} radius={0.03} />
      ))}
    </group>
  )
}

export function Butterfly({ color = '#f8c8dc', center = [0, 1, 0] as V3, radius = 2, speed = 0.5, seed = 0 }) {
  const g = useRef<THREE.Group>(null!)
  const left = useRef<THREE.Mesh>(null!)
  const right = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + seed
    const x = center[0] + Math.sin(t) * radius
    const z = center[2] + Math.sin(t * 2) * radius * 0.5
    const y = center[1] + Math.sin(t * 3) * 0.3
    const dx = Math.cos(t) * radius
    const dz = Math.cos(t * 2) * radius
    g.current.position.set(x, y, z)
    g.current.rotation.y = Math.atan2(dx, dz)
    const flap = Math.sin(clock.elapsedTime * 18 + seed) * 0.9
    left.current.rotation.z = flap
    right.current.rotation.z = -flap
  })
  return (
    <group ref={g}>
      <mesh ref={left}>
        <circleGeometry args={[0.09, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={right}>
        <circleGeometry args={[0.09, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ───────────────────────────── Toys ─────────────────────────────

/**
 * A ball the cat can nudge around. It reads the cat's live position and
 * rolls away with a little friction when bumped.
 */
export function YarnBall({
  start,
  color = '#f4a7b9',
  radius = 0.16,
  cat,
  bounds,
}: {
  start: [number, number]
  color?: string
  radius?: number
  cat?: React.RefObject<THREE.Vector3>
  bounds: Bounds
}) {
  const g = useRef<THREE.Group>(null!)
  const spin = useRef<THREE.Group>(null!)
  const state = useRef({ x: start[0], z: start[1], vx: 0, vz: 0 })
  const axis = useMemo(() => new THREE.Vector3(), [])
  const q = useMemo(() => new THREE.Quaternion(), [])

  useFrame((_, dt) => {
    const s = state.current
    const catPos = cat?.current
    if (catPos) {
      const dx = s.x - catPos.x
      const dz = s.z - catPos.z
      const d = Math.hypot(dx, dz)
      const reach = radius + 0.35
      if (d < reach && d > 0.0001) {
        const push = (reach - d) * 25
        s.vx += (dx / d) * push * dt
        s.vz += (dz / d) * push * dt
      }
    }
    s.x += s.vx * dt
    s.z += s.vz * dt
    // bounce off the edges
    if (s.x < bounds.minX || s.x > bounds.maxX) { s.vx *= -0.6; s.x = THREE.MathUtils.clamp(s.x, bounds.minX, bounds.maxX) }
    if (s.z < bounds.minZ || s.z > bounds.maxZ) { s.vz *= -0.6; s.z = THREE.MathUtils.clamp(s.z, bounds.minZ, bounds.maxZ) }
    const friction = Math.exp(-dt * 1.6)
    s.vx *= friction
    s.vz *= friction

    g.current.position.set(s.x, radius, s.z)
    const v = Math.hypot(s.vx, s.vz)
    if (v > 0.001) {
      axis.set(s.vz, 0, -s.vx).normalize()
      q.setFromAxisAngle(axis, (v * dt) / radius)
      spin.current.quaternion.premultiply(q)
    }
  })

  return (
    <group ref={g}>
      <group ref={spin}>
        <mesh castShadow>
          <sphereGeometry args={[radius, 20, 16]} />
          <Soft color={color} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[i * 1.1, i * 0.7, 0]}>
            <torusGeometry args={[radius * 0.98, radius * 0.08, 6, 24]} />
            <Soft color="#ffffff" opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
