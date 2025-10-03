import React from 'react'

const PROJECTS = [
  {
    id: 'p1',
    name: 'ColorLyst',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200&auto=format&fit=crop',
    description: 'Color your life!',
    href: '#'
  },
  {
    id: 'p2',
    name: 'Type Bottow',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop',
    description: 'Copy sutras. Take notes.',
    href: 'https://typingbull.pages.dev'
  },
  {
    id: 'p3',
    name: 'Crystie',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    description: 'Hack the crystals. Solve the mystery.',
    href: '#'
  },
]

export default function Projects() {
  return (
    <div className="projects">
      {PROJECTS.map(p => (
        <article className="projectCard" key={p.id}>
          <div className="thumb" style={{ backgroundImage: `url(${p.image})` }} />
          <div className="cardBody">
            <h4 className="cardTitle">{p.name}</h4>
            <p className="cardDesc">{p.description}</p>
            <a className="button cardLink" href={p.href}>View Project</a>
          </div>
        </article>
      ))}
    </div>
  )
}