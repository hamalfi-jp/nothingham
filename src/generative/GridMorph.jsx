
import React, { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

// Palettes inspired by your Processing sketch
const PALETTES = [
  { name: 'Benedictus', colors: ['#F27EA9','#366CD9','#5EADF2','#636E73','#F2E6D8'] },
  { name: 'Cross', colors: ['#D962AF','#58A6A6','#8AA66F','#F29F05','#F26D6D'] },
  { name: 'Hiroshige', colors: ['#1B618C','#55CCD9','#F2BC57','#F2DAAC','#F24949'] },
  { name: 'Hokusai Blue', colors: ['#023059','#459DBF','#87BF60','#D9D16A','#F2F2F2'] },
  { name: 'Mono', colors: ['#D9D7D8','#3B5159','#5D848C','#7CA2A6','#262321'] },
]

// Easing (subset, including easeOutQuint as used)
const Easing = {
  easeOutQuint: (x) => 1 - Math.pow(1 - x, 5),
}

// Build a recursive grid of voxels, similar to separateGrid() in your sketch
function buildGrid({ base=10, seed=1, palette=PALETTES[0].colors }) {
  const rand = (a=0,b=1) => a + (b-a) * (Math.abs(Math.sin(seed++ * 1.2345)) % 1)
  const items = []

  function separateGrid(x, y, z, d, dd) {
    const sepNum = Math.floor(rand(1,4)) // [1..3]
    const w = d / sepNum
    for (let i = x; i < x + d - 1e-6; i += w) {
      for (let j = y; j < y + d - 1e-6; j += w) {
        // Similar stopping criterion: keep splitting with high probability while large
        if ( (rand(0,100) < 90 && d > base/5) || w > base/1.8 ) {
          separateGrid(i, j, z, w, dd)
        } else {
          // Fill along z
          let k = z
          while (k < dd - 1e-6) {
            let kStep = (dd/2) / Math.max(1, Math.floor(rand(1,5))) // chunking
            if (k + kStep > dd) kStep = dd - k
            items.push({
              pos: [i + w/2, j + w/2, k + kStep/2],
              size: [Math.max(0.15, w-0.2), Math.max(0.15, w-0.2), Math.max(0.12, kStep)],
              color: palette[ Math.floor(rand(0, palette.length)) ],
              // initial box/ellipsoid selection (was noise-based in p5)
              isBox: rand() > 0.5,
              pt: 0, // previous toggle time
            })
            k += kStep
          }
        }
      }
    }
  }

  separateGrid(-base/2, -base/2, -base/2, base, base/2)

  // Precompute max distance for timing offset
  let distanceMax = 0
  for (const it of items) {
    const d = Math.hypot(it.pos[0], it.pos[1], Math.max(base/2, Math.abs(it.pos[2])))
    if (d > distanceMax) distanceMax = d
    it.distance = d
  }
  return { items, distanceMax, base }
}

function Voxel({ it, distanceMax, material }) {
  const group = useRef()
  const boxRef = useRef()
  const sphereRef = useRef()
  const stateRef = useRef({ isBox: it.isBox, pt: 0 })

  useFrame(({ clock }, dt) => {
    const t = (it.distance / distanceMax) + clock.elapsedTime / 2.0 // speed similar to frameCount/200
    const st = stateRef.current
    if (t - st.pt > 1) { // toggle every ~1.0 in local time
      st.isBox = !st.isBox
      st.pt = t
    }
    const v = Easing.easeOutQuint(t % 1)

    if (group.current) {
      group.current.position.set(it.pos[0], it.pos[1], it.pos[2])
      group.current.rotation.x += dt * 0.0 // per-voxel rotation (optional)
      group.current.rotation.y += dt * 0.0
    }

    const sx = it.size[0] * v
    const sy = it.size[1] * v
    const sz = it.size[2] * v

    if (boxRef.current) {
      boxRef.current.visible = st.isBox
      boxRef.current.scale.set(sx, sy, sz)
    }
    if (sphereRef.current) {
      sphereRef.current.visible = !st.isBox
      sphereRef.current.scale.set(it.size[0] * 0.5 * v, it.size[1] * 0.5 * v, it.size[2] * 0.5 * v)
    }
  })

  return (
    <group ref={group}>
      <mesh ref={boxRef} castShadow receiveShadow>
        <boxGeometry args={[1,1,1]} />
        <meshStandardMaterial color={it.color} {...material} />
      </mesh>
      <mesh ref={sphereRef} castShadow receiveShadow>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={it.color} {...material} />
      </mesh>
    </group>
  )
}

function VoxelField({ paletteIndex=0 }) {
  const material = { roughness: 0.35, metalness: 0.15 }
  const { items, distanceMax, base } = useMemo(
    () => buildGrid({ base: 10, seed: Math.random()*1000, palette: PALETTES[paletteIndex].colors }),
    [paletteIndex]
  )

  const root = useRef()
  useFrame((_, dt) => {
    if (root.current) {
      root.current.rotation.x += dt / 5 // rotateX(frameCount / 300)
      root.current.rotation.y += dt / 6.67 // rotateY(frameCount / 400)
      root.current.rotation.z += dt / 8.33 // rotateZ(frameCount / 500)
    }
  })

  return (
    <group ref={root}>
      {items.map((it, i) => (
        <Voxel key={i} it={it} distanceMax={distanceMax} material={material} />
      ))}
    </group>
  )
}

export default function GridMorphCanvas({ palette=0 }) {
  const [paletteIndex] = useState(palette)

  return (
    <Canvas
      shadows
      dpr={[1,2]}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ position:'absolute', inset:0 }}
    >
      <OrthographicCamera
        makeDefault
        position={[18, 18, 18]}
        zoom={35}
        near={-100}
        far={100}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 12, 8]} intensity={1.1} castShadow />
      <directionalLight position={[-12, -6, -10]} intensity={0.35} />

      <VoxelField paletteIndex={paletteIndex} />

      <ContactShadows opacity={0.35} scale={60} blur={2.5} far={20} position={[0, -6, 0]} />
      <Environment preset="city" />
      <OrbitControls enableDamping dampingFactor={0.08} />
    </Canvas>
  )
}
