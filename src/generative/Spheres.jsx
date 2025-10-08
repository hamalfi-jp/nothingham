import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function Movers({ count = 18, radius = 2.8, reducedMotion = false }) {
  const group = useRef()
  const meshes = useRef([])
  const seeds = useMemo(() => {
    const rng = Math.random
    return new Array(count).fill(0).map((_, i) => ({
      // random phase/speed per axis
      phase: [rng()*Math.PI*2, rng()*Math.PI*2, rng()*Math.PI*2],
      speed: [0.18 + rng()*0.45, 0.18 + rng()*0.45, 0.18 + rng()*0.45],
      amp: [0.9 + rng()*1.6, 0.9 + rng()*1.6, 0.9 + rng()*1.6],
      size: 0.22 + rng()*0.5
    }))
  }, [count])

  useFrame((state, dt) => {
    if (reducedMotion) return
    const t = state.clock.elapsedTime
    for (let i=0; i<seeds.length; i++) {
      const m = meshes.current[i]
      if (!m) continue
      const s = seeds[i]
      // Smooth pseudo-orbit via phase-shifted sines (lissajous-style)
      const x = Math.sin(t * s.speed[0] + s.phase[0]) * (radius * 0.75 + s.amp[0]*0.6)
      const y = Math.cos(t * s.speed[1] + s.phase[1]) * (radius * 0.35 + s.amp[1]*0.4) * 0.9
      const z = Math.sin(t * s.speed[2] + s.phase[2]) * (radius * 0.7 + s.amp[2]*0.5)
      m.position.set(x, y, z)
      m.rotation.x += dt * 0.25
      m.rotation.y += dt * 0.18
    }
  })

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => (meshes.current[i] = el)}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[s.size, 64, 64]} />
          <MeshTransmissionMaterial
            thickness={0.6}
            roughness={0.2}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.02}
            anisotropy={0.15}
            distortionScale={0.2}
            temporalDistortion={0.25}
            attenuationColor="#8ab4ff"
            attenuationDistance={2.2}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function SpheresCanvas() {
  // Respect user's reduced motion preference
  const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [0, 0.9, 8.5], fov: 42 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* Lights */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 6, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, -2, -3]} intensity={0.35} />

      {/* Movers */}
      <Movers count={22} radius={3.2} reducedMotion={reducedMotion} />

      {/* Ground contact shadows for modern look */}
      <ContactShadows
        opacity={0.5}
        scale={14}
        blur={2.6}
        far={8}
        resolution={1024}
        position={[0, -2.1, 0]}
      />

      {/* Image-based lighting for glossy refractions */}
      <Environment preset="city" />
    </Canvas>
  )
}
