import React from 'react'
import InfiniteMenu from '../InifiniteMenu_reactbits/InfiniteMenu.jsx'
import colorLystImg from '../assets/Cololyst_Logo.gif'
import typeBottowImg from '../assets/matrixrain.gif'
import crysieImg from '../assets/crysie_icon.png'

const PROJECTS = [
  {
    id: 'p1',
    name: 'ColorLyst',
    image: colorLystImg,
    description: 'Color your life!',
    href: 'https://colorlyst-project.pages.dev'
  },
  {
    id: 'p2',
    name: 'Type Bottow',
    image: typeBottowImg,
    description: 'Copy sutras. Take notes.',
    href: 'https://typingbull.pages.dev'
  },
  {
    id: 'p3',
    name: 'Crystie',
    image: crysieImg,
    description: 'Hack the crystals. Solve the mystery.',
    href: 'https://crystie.pages.dev'
  },
]

export default function Projects() {
  return (
    <div className="projectsSphere" style={{ width: '100%', height: '60vh', minHeight: 480 }}>
      <InfiniteMenu
        items={PROJECTS.map(p => ({
          image: p.image,
          link: p.href,
          title: p.name,
          description: p.description
        }))}
      />
    </div>
  )
}

// export default function Projects() {
//   return (
//     <div className="projects">
//       {PROJECTS.map(p => (
//         <article className="projectCard" key={p.id}>
//           <div className="thumb" style={{ backgroundImage: `url(${p.image})` }} />
//           <div className="cardBody">
//             <h4 className="cardTitle">{p.name}</h4>
//             <p className="cardDesc">{p.description}</p>
//             <a className="button cardLink" href={p.href}>View Project</a>
//           </div>
//         </article>
//       ))}
//     </div>
//   )
// }