import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Breed } from '../types'

/** Live movement info the controller writes and the cat animates from. */
export interface CatMotion {
  speed: number // world units / second
  airborne: boolean
}

const PINK = '#f4a7b9'
const DARK = '#3b3040'

function Mat({ color, opacity = 1 }: { color: string; opacity?: number }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.85}
      metalness={0}
      transparent={opacity < 1}
      opacity={opacity}
    />
  )
}

type V3 = [number, number, number]

function Ball({
  r, color, position, scale, rotation, shadow = true, opacity,
}: { r: number; color: string; position?: V3; scale?: V3; rotation?: V3; shadow?: boolean; opacity?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={rotation} castShadow={shadow}>
      <sphereGeometry args={[r, 24, 18]} />
      <Mat color={color} opacity={opacity} />
    </mesh>
  )
}

export function Cat({ breed, motion }: { breed: Breed; motion?: React.RefObject<CatMotion> }) {
  const { coat, pattern } = breed
  const c = useMemo(() => {
    const points = pattern === 'points'
    return {
      ears: points ? coat.accent : coat.base,
      muzzle: points ? coat.accent : coat.belly,
      legs: points ? coat.accent : coat.base,
      paws: points ? coat.accent : coat.belly,
      tail: points ? coat.accent : coat.base,
    }
  }, [coat, pattern])

  const body = useRef<THREE.Group>(null!)
  const head = useRef<THREE.Group>(null!)
  const eyes = useRef<THREE.Group>(null!)
  const legs = useRef<THREE.Group[]>([])
  const tail = useRef<THREE.Group[]>([])
  const anim = useRef({ phase: 0, nextBlink: 2, blink: 0 })

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const a = anim.current
    const speed = motion?.current?.speed ?? 0
    const airborne = motion?.current?.airborne ?? false
    const moving = speed > 0.05
    const amp = Math.min(speed / 1.4, 1.3)
    const k = 1 - Math.exp(-dt * 12) // smoothing factor

    if (moving) a.phase += dt * (5 + speed * 4)
    const s = Math.sin(a.phase)

    // Legs: diagonal pairs swing together. FL, FR, BL, BR.
    const targets = airborne
      ? [-0.7, -0.7, 0.7, 0.7]
      : moving
        ? [s * 0.7 * amp, -s * 0.7 * amp, -s * 0.7 * amp, s * 0.7 * amp]
        : [0, 0, 0, 0]
    legs.current.forEach((leg, i) => {
      leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, targets[i], k)
    })

    // Body bob + breathing.
    body.current.position.y = moving && !airborne ? Math.abs(s) * 0.03 * amp : 0
    body.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012

    // Head looks around when idle, faces forward when walking.
    const look = moving ? 0 : Math.sin(t * 0.45) * 0.35
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, look, k * 0.3)
    head.current.rotation.x = moving ? Math.sin(a.phase * 2) * 0.04 : Math.sin(t * 0.7) * 0.05

    // Tail: gentle S-curve sway, faster when walking.
    const sway = moving ? 4 : 1.8
    tail.current.forEach((seg, i) => {
      seg.rotation.z = Math.sin(t * sway - i * 0.6) * (0.18 + i * 0.03)
    })

    // Blink every few seconds.
    if (t > a.nextBlink) {
      a.blink = 0.15
      a.nextBlink = t + 2 + Math.random() * 4
    }
    a.blink = Math.max(0, a.blink - dt)
    eyes.current.scale.y = a.blink > 0 ? 0.1 : 1
  })

  const legPos: V3[] = [
    [0.1, 0.28, 0.17],
    [-0.1, 0.28, 0.17],
    [0.1, 0.28, -0.17],
    [-0.1, 0.28, -0.17],
  ]

  // Tail: a chain of nested segments, each curling slightly upward.
  const tailSegments = 5
  let tailNode: ReactNode = null
  for (let i = tailSegments - 1; i >= 0; i--) {
    const stripe = pattern === 'tabby' && i % 2 === 1
    const tip = i === tailSegments - 1
    const color = stripe ? coat.accent : tip && pattern === 'tabby' ? coat.accent : c.tail
    tailNode = (
      <group
        ref={(g) => { if (g) tail.current[i] = g }}
        position={i === 0 ? [0, 0.42, -0.36] : [0, 0.12, 0]}
        rotation={[i === 0 ? -1.0 : 0.28, 0, 0]}
      >
        <mesh position={[0, 0.06, 0]} castShadow>
          <capsuleGeometry args={[0.045 - i * 0.002, 0.08, 6, 12]} />
          <Mat color={color} />
        </mesh>
        {tailNode}
      </group>
    )
  }

  return (
    <group>
      <group ref={body}>
        {/* Torso */}
        <mesh position={[0, 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.32, 10, 20]} />
          <Mat color={coat.base} />
        </mesh>
        {/* Chest */}
        <Ball r={0.16} color={coat.belly} position={[0, 0.38, 0.22]} scale={[1, 1.05, 0.9]} />

        {pattern === 'tabby' &&
          [-0.16, -0.03, 0.1].map((z) => (
            <mesh key={z} position={[0, 0.38, z]} scale={[1.02, 1.02, 1]}>
              <torusGeometry args={[0.196, 0.024, 8, 32, Math.PI]} />
              <Mat color={coat.accent} />
            </mesh>
          ))}
        {pattern === 'calico' && (
          <>
            <Ball r={0.13} color={coat.accent} position={[0.07, 0.52, -0.08]} scale={[1, 0.55, 1.3]} />
            <Ball r={0.1} color={coat.patch ?? coat.accent} position={[-0.09, 0.5, 0.14]} scale={[1, 0.6, 1.1]} />
            <Ball r={0.08} color={coat.patch ?? coat.accent} position={[0.12, 0.42, -0.25]} scale={[0.8, 0.8, 1]} />
          </>
        )}

        {/* Legs (hip pivots so they can swing) */}
        {legPos.map((p, i) => (
          <group key={i} position={p} ref={(g) => { if (g) legs.current[i] = g }}>
            <mesh position={[0, -0.11, 0]} castShadow>
              <capsuleGeometry args={[0.055, 0.14, 6, 12]} />
              <Mat color={c.legs} />
            </mesh>
            <Ball r={0.065} color={c.paws} position={[0, -0.225, 0.01]} scale={[1, 0.7, 1.2]} />
          </group>
        ))}

        {tailNode}

        {/* Head */}
        <group ref={head} position={[0, 0.62, 0.3]}>
          <Ball r={0.22} color={coat.base} scale={[1.1, 0.95, 0.95]} />

          {pattern === 'tabby' &&
            [-0.06, 0, 0.06].map((x) => (
              <Ball key={x} r={0.03} color={coat.accent} position={[x, 0.18, 0.09]} scale={[0.5, 0.4, 1.4]} rotation={[0.6, 0, 0]} shadow={false} />
            ))}
          {pattern === 'calico' && (
            <>
              <Ball r={0.11} color={coat.accent} position={[0.11, 0.1, 0]} scale={[1, 1, 0.9]} shadow={false} />
              <Ball r={0.09} color={coat.patch ?? coat.accent} position={[-0.12, 0.12, -0.06]} shadow={false} />
            </>
          )}

          {/* Ears */}
          {[1, -1].map((side) => (
            <group key={side} position={[0.12 * side, 0.17, -0.02]} rotation={[0, 0, -0.35 * side]}>
              <mesh castShadow>
                <coneGeometry args={[0.075, 0.15, 16]} />
                <Mat color={c.ears} />
              </mesh>
              <mesh position={[0, -0.01, 0.028]}>
                <coneGeometry args={[0.045, 0.1, 16]} />
                <Mat color={PINK} />
              </mesh>
            </group>
          ))}

          {/* Muzzle, nose, cheeks */}
          <Ball r={0.09} color={c.muzzle} position={[0, -0.07, 0.17]} scale={[1.4, 0.85, 0.9]} shadow={false} />
          <Ball r={0.025} color={PINK} position={[0, -0.035, 0.245]} scale={[1.3, 0.8, 0.8]} shadow={false} />
          {[1, -1].map((side) => (
            <Ball key={side} r={0.04} color={PINK} opacity={0.55} position={[0.145 * side, -0.06, 0.15]} shadow={false} />
          ))}

          {/* Eyes */}
          <group ref={eyes} position={[0, 0.02, 0]}>
            {[1, -1].map((side) => (
              <group key={side} position={[0.085 * side, 0, 0.185]}>
                <Ball r={0.05} color={coat.eyes} scale={[1, 1, 0.6]} shadow={false} />
                <Ball r={0.034} color={DARK} position={[0, 0, 0.02]} scale={[0.85, 1, 0.5]} shadow={false} />
                <Ball r={0.012} color="#ffffff" position={[0.014, 0.016, 0.038]} shadow={false} />
              </group>
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}
