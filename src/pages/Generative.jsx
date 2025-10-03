import React from 'react'
import { Link, useRoute } from 'wouter'

const CARDS = [
  { id: 'spheres', title: 'Spheres', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop', desc: 'WebGL spheres with palette-driven motion.' },
  { id: 'density', title: 'Density Cubes', image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop', desc: 'Noise-driven voxel density field.' },
  { id: 'grid', title: 'Grid Morph', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop', desc: 'Easing-based voxel morph animation.' },
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

