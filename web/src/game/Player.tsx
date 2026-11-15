import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Cat, type CatMotion } from '../components/Cat'
import type { Breed } from '../types'
import type { PlaceWorld } from '../places/types'
import { useKeyboard } from './useKeyboard'

const CAT_RADIUS = 0.28
const WALK = 1.5
const RUN = 3.2
const TURN = 2.8 // radians / second
const JUMP = 3.4
const GRAVITY = 11

interface Props {
  breed: Breed
  name: string
  world: PlaceWorld
  /** Shared live position (read by toys). */
  position: React.RefObject<THREE.Vector3>
  /** Click-to-walk destination, set by the floor. */
  target: React.RefObject<THREE.Vector3 | null>
}

export function Player({ breed, name, world, position, target }: Props) {
  const keys = useKeyboard()
  const { camera, gl } = useThree()
  const root = useRef<THREE.Group>(null!)
  const marker = useRef<THREE.Mesh>(null!)
  const motion = useRef<CatMotion>({ speed: 0, airborne: false })
  const s = useRef({
    heading: world.spawn.heading,
    camYaw: world.spawn.heading,
    camDist: 2.8,
    y: 0,
    vy: 0,
    speed: 0,
    stuckTime: 0,
    lastDist: Infinity,
  })
  const tmp = useRef({ cam: new THREE.Vector3(), look: new THREE.Vector3() })

  // Reset when entering a place.
  useEffect(() => {
    position.current.set(world.spawn.x, 0, world.spawn.z)
    s.current.heading = s.current.camYaw = world.spawn.heading
    target.current = null
    const st = s.current
    camera.position.set(
      world.spawn.x - Math.sin(st.heading) * st.camDist,
      1.6,
      world.spawn.z - Math.cos(st.heading) * st.camDist,
    )
  }, [world, camera, position, target])

  // Scroll to zoom the follow camera.
  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      s.current.camDist = THREE.MathUtils.clamp(s.current.camDist + e.deltaY * 0.004, 1.6, 6)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [gl])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05)
    const st = s.current
    const k = keys.current
    const pos = position.current

    // ── input ──
    let forward = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0)
    const turn = (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0) - (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0)
    const running = k.has('ShiftLeft') || k.has('ShiftRight')
    if (forward || turn) target.current = null // keyboard overrides click-to-walk

    st.heading += turn * TURN * dt

    // ── click-to-walk ──
    const goal = target.current
    if (goal) {
      const dx = goal.x - pos.x
      const dz = goal.z - pos.z
      const dist = Math.hypot(dx, dz)
      if (dist < 0.15) {
        target.current = null
      } else {
        const desired = Math.atan2(dx, dz)
        let diff = desired - st.heading
        diff = Math.atan2(Math.sin(diff), Math.cos(diff))
        st.heading += THREE.MathUtils.clamp(diff, -TURN * 1.6 * dt, TURN * 1.6 * dt)
        forward = Math.abs(diff) < 1.2 ? 1 : 0.2
        // give up if blocked by furniture
        if (dist > st.lastDist - 0.002) st.stuckTime += dt
        else st.stuckTime = 0
        st.lastDist = dist
        if (st.stuckTime > 0.6) target.current = null
      }
    } else {
      st.stuckTime = 0
      st.lastDist = Infinity
    }

    // ── movement ──
    const maxSpeed = (running || (goal && Math.hypot(goal.x - pos.x, goal.z - pos.z) > 4) ? RUN : WALK) * forward
    st.speed = THREE.MathUtils.lerp(st.speed, maxSpeed, 1 - Math.exp(-dt * 8))
    pos.x += Math.sin(st.heading) * st.speed * dt
    pos.z += Math.cos(st.heading) * st.speed * dt

    // ── collisions ──
    for (const c of world.colliders) {
      const dx = pos.x - c.x
      const dz = pos.z - c.z
      const d = Math.hypot(dx, dz)
      const min = c.r + CAT_RADIUS
      if (d < min && d > 0.0001) {
        pos.x = c.x + (dx / d) * min
        pos.z = c.z + (dz / d) * min
      }
    }
    const b = world.bounds
    pos.x = THREE.MathUtils.clamp(pos.x, b.minX, b.maxX)
    pos.z = THREE.MathUtils.clamp(pos.z, b.minZ, b.maxZ)

    // ── jumping ──
    if (k.has('Space') && st.y === 0) st.vy = JUMP
    st.vy -= GRAVITY * dt
    st.y = Math.max(0, st.y + st.vy * dt)
    if (st.y === 0) st.vy = 0
    pos.y = st.y

    root.current.position.copy(pos)
    root.current.rotation.y = st.heading
    motion.current.speed = Math.abs(st.speed)
    motion.current.airborne = st.y > 0.02

    // ── target marker ──
    if (target.current) {
      marker.current.visible = true
      marker.current.position.set(target.current.x, 0.03, target.current.z)
      const pulse = 1 + Math.sin(performance.now() / 150) * 0.12
      marker.current.scale.setScalar(pulse)
    } else {
      marker.current.visible = false
    }

    // ── third-person follow camera ──
    let yawDiff = st.heading - st.camYaw
    yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff))
    st.camYaw += yawDiff * (1 - Math.exp(-dt * 3))
    const { cam, look } = tmp.current
    cam.set(
      pos.x - Math.sin(st.camYaw) * st.camDist,
      0.9 + st.camDist * 0.32 + st.y * 0.5,
      pos.z - Math.cos(st.camYaw) * st.camDist,
    )
    if (world.clampCamera) {
      cam.x = THREE.MathUtils.clamp(cam.x, b.minX - 0.2, b.maxX + 0.2)
      cam.z = THREE.MathUtils.clamp(cam.z, b.minZ - 0.2, b.maxZ + 0.2)
    }
    camera.position.lerp(cam, 1 - Math.exp(-dt * 6))
    look.set(pos.x, 0.55 + st.y * 0.6, pos.z)
    camera.lookAt(look)
  })

  return (
    <>
      <group ref={root}>
        <Cat breed={breed} motion={motion} />
        <Html position={[0, 1.15, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className="nametag">{name}</div>
        </Html>
      </group>
      <mesh ref={marker} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.14, 0.2, 32]} />
        <meshBasicMaterial color="#f4a7b9" transparent opacity={0.85} />
      </mesh>
    </>
  )
}
