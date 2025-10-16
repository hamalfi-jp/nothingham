import React, { useEffect, useMemo, useRef } from 'react'
import { useLocation } from 'wouter'
import InfiniteMenu from '../reactbits/InfiniteMenu.jsx'
import spheresImg from '../assets/spheres.png'
import densityImg from '../assets/density_cube.png'
import gridImg from '../assets/grid_morph.png'
import dropletImg from '../assets/droplet.png'

const CARDS = [
  { id: 'droplet', title: 'Droplet Nodes', image: dropletImg, link: '/generative/droplet', description: 'Interactive particle network visualization with fluid dynamics.' },
  { id: 'density', title: 'Density Cubes', image: densityImg, link: '/generative/density', description: '3D volumetric visualization with dynamic density fields.' },
  { id: 'grid', title: 'Grid Morph', image: gridImg, link: '/generative/grid', description: 'Morphing grid animation with wave propagation effects.' },
  { id: 'spheres', title: 'Sphere', image: spheresImg, link: '/generative/spheres', description: 'Animated sphere composition with particle effects.' },
]

export default function Generative() {
  const [location, setLocation] = useLocation()
  const hasInitialized = useRef(false)
  
  // Memoize items array to prevent InfiniteMenu from recreating WebGL context
  const menuItems = useMemo(() => CARDS.map(c => ({
    image: c.image,
    link: c.link,
    title: c.title,
    description: c.description
  })), [])
  
  // Initialize to first item only on first mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      const isGenerativeRoot = location === '/generative' || location === '/generative/'
      if (isGenerativeRoot) {
        setLocation('/generative/droplet', { replace: true })
      }
    }
  }, [location, setLocation])
  
  return (
    <div className="generativeSphere" style={{ width: '100%', height: '60vh', minHeight: 480 }}>
      <InfiniteMenu
        items={menuItems}
        enableAutoNavigation={true}
      />
    </div>
  )
}

