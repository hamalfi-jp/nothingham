import React from 'react'
import { Link, useRoute } from 'wouter'
import spheresImg from '../assets/spheres.png'
import densityImg from '../assets/density_cube.png'
import gridImg from '../assets/grid_morph.png'

const CARDS = [
  { id: 'spheres', title: 'Sphere', image: spheresImg, desc: 'WebGL spheres with palette-driven motion.' },
  { id: 'density', title: 'Density Cubes', image: densityImg, desc: 'Noise-driven voxel density field.' },
  { id: 'grid', title: 'Grid Morph', image: gridImg, desc: 'Easing-based voxel morph animation.' },
]

export default function Generative() {
  const [isKindRoute, params] = useRoute('/generative/:kind')
  const title = isKindRoute ? `Generative — ${params.kind}` : 'Generative Gallery'

  return (
    <div className="projects">
      <div className="kicker">
        <h3>{title}</h3>
        <p style={{margin:0}}>Choose a sketch to display on the left.</p>
      </div>
      {CARDS.map(c => (
        <article className="projectCard" key={c.id}>
          <div className="thumb" style={{ backgroundImage: `url(${c.image})` }} />
          <div className="cardBody">
            <h4 className="cardTitle">{c.title}</h4>
            <p className="cardDesc">{c.desc}</p>
            <Link to={`/generative/${c.id}`} className="button cardLink">Show</Link>
          </div>
        </article>
      ))}
    </div>
  )
}

