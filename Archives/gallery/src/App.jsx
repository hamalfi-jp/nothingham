// src/App.jsx
import * as THREE from 'three'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { MeshPortalMaterial, CameraControls, Gltf, Text, Preload, useCursor } from '@react-three/drei'
import { useRoute, useLocation } from 'wouter'
import { easing, geometry } from 'maath'
import { suspend } from 'suspend-react'

extend(geometry)
const regular = import('@pmndrs/assets/fonts/inter_regular.woff')
const medium  = import('@pmndrs/assets/fonts/inter_medium.woff')

function Frame({ id, name, author, bg = '#d9d9d9', width = 1, height = 1.618, children, ...props }) {
  const portal = useRef()
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  useFrame((state, dt) => easing.damp(portal.current, 'blend', params?.id === id ? 1 : 0, 0.2, dt))
  return (
    <group {...props}>
      <Text font={suspend(medium).default} fontSize={0.3} anchorY="top" anchorX="left" lineHeight={0.8} position={[-0.375, 0.715, 0.01]} material-toneMapped={false}>
        {name}
      </Text>
      <Text font={suspend(regular).default} fontSize={0.1} anchorX="right" position={[0.4, -0.659, 0.01]} material-toneMapped={false}>/{id}</Text>
      <Text font={suspend(regular).default} fontSize={0.04} anchorX="right" position={[0.0, -0.677, 0.01]} material-toneMapped={false}>{author}</Text>
      <mesh
        name={id}
        onDoubleClick={(e) => { e.stopPropagation(); setLocation('/item/' + e.object.name) }}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}>
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial ref={portal} events={params?.id === id} side={THREE.DoubleSide}>
          <color attach="background" args={[bg]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}

function Rig({ position = new THREE.Vector3(0, 0, 2), focus = new THREE.Vector3(0, 0, 0) }) {
  const { controls, scene } = useThree()
  const [, params] = useRoute('/item/:id')
  useEffect(() => {
    const active = scene.getObjectByName(params?.id)
    if (active) {
      active.parent.localToWorld(position.set(0, 0.5, 0.25))
      active.parent.localToWorld(focus.set(0, 0, -2))
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true)
  })
  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
}

// Safe loader for GLTF assets that shows a placeholder when the asset is missing
function SafeGltf({ src, ...props }) {
  const [resolvedUrl, setResolvedUrl] = useState(src)
  const [exists, setExists] = useState(true)

  useEffect(() => {
    let isMounted = true
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.origin)
      const finalUrl = new URL(src, base).href
      if (isMounted) setResolvedUrl(finalUrl)
      fetch(finalUrl, { method: 'HEAD' })
        .then((r) => isMounted && setExists(r.ok))
        .catch(() => isMounted && setExists(false))
    } catch (_) {
      if (isMounted) setExists(false)
    }
    return () => {
      isMounted = false
    }
  }, [src])

  if (exists) {
    return (
      <Suspense fallback={<group />}>
        <Gltf src={resolvedUrl} {...props} />
      </Suspense>
    )
  }

  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={"tomato"} />
      </mesh>
      <Text font={suspend(regular).default} fontSize={0.08} position={[0, -0.8, 0]} material-toneMapped={false}>
        Missing asset: {src}
      </Text>
    </group>
  )
}

export default function App() {
  return (
    <Canvas
      flat
      camera={{ fov: 75, position: [0, 0, 20] }}
      dpr={[1, 1.5]}                       // Reduce DPR to avoid heavy load on mobile
      gl={{ antialias: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Frame id="01" name={`pick\nles`} author="Omar Faruq Tawsif" bg="#e4cdac" position={[-1.15, 0, 0]} rotation={[0, 0.5, 0]}>
        <SafeGltf src="pickles.glb" scale={8} position={[0, -0.7, -2]} />
      </Frame>
      <Frame id="02" name="tea" author="Omar Faruq Tawsif">
        <SafeGltf src="tea.glb" position={[0, -2, -3]} />
      </Frame>
      <Frame id="03" name="still" author="Omar Faruq Tawsif" bg="#d1d1ca" position={[1.15, 0, 0]} rotation={[0, -0.5, 0]}>
        <SafeGltf src="still.glb" scale={2} position={[0, -0.8, -4]} />
      </Frame>
      <Rig />
      <Preload all />
    </Canvas>
  )
}
