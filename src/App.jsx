import React from 'react'
import { Route, Switch, Link, useLocation, Router } from 'wouter'
import GooeyNav from './reactbits/GooeyNav.jsx'
import ASCIIText from './reactbits/ASCIIText.jsx'
import SpheresCanvas from './generative/Spheres.jsx'
import DensityCubeCanvas from './generative/density_cube3D.jsx'
import GridMorphCanvas from './generative/GridMorph.jsx'
import DropletNodesCanvas from './generative/DropletNodes.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/Contact.jsx'
import Generative from './pages/Generative.jsx'

function Heading() {
  const [location] = useLocation()
  const [isMobile, setIsMobile] = React.useState(false)
  
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 960)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const titleMap = {
    // '/': 'ColorLyst Projects',
    // '/about': 'About ColorLyst',
    // '/projects': 'Selected Projects',
    // '/contact': 'Get in Touch'
  }
  const pageTitle = titleMap[location] ?? 'ColorLyst'
  const showAsciiTitle = pageTitle === 'ColorLyst'
  
  return (
    <>
      {/* <span className="brand">ColorLyst</span> */}
      {showAsciiTitle ? (
        isMobile ? (
          <h1 className="title" style={{ fontSize: 'clamp(32px, 10vw, 48px)', margin: '20px 0' }}>ColorLyst</h1>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '140px', maxWidth: '100%', overflow: 'hidden'}}>
            <ASCIIText text="ColorLyst  " asciiFontSize={4} textFontSize={180} planeBaseHeight={15} enableWaves={true} />
          </div>
        )
      ) : (
        <h1 className="title">{pageTitle}</h1>
      )}
      <p className="subtitle">
        The web serves both as the graveyard of innumerable ideas and the scrapbook that links disparate points; 
        this, in essence, is its nature. - Niao.
      </p>
    </>
  )
}

export default function App() {
  const [location, setLocation] = useLocation()
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Projects', href: '/projects' },
    { label: 'Generative', href: '/generative' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ]
  const activeIndex = (() => {
    if (location.startsWith('/generative')) return 2
    const idx = navItems.findIndex(i => i.href === location)
    return idx >= 0 ? idx : 0
  })()
  const LeftCanvas =
    location.startsWith('/generative/spheres') ? SpheresCanvas :
    location.startsWith('/generative/density') ? DensityCubeCanvas :
    location.startsWith('/generative/grid') ? GridMorphCanvas :
    location.startsWith('/generative/droplet') ? DropletNodesCanvas :
    location === '/' ? DensityCubeCanvas :
    location === '/about' ? DensityCubeCanvas :
    location === '/projects' ? DensityCubeCanvas :
    location === '/contact' ? DensityCubeCanvas :
    GridMorphCanvas
  return (
    <Router>
      <div className="app">
        <div className="leftPane">
          <LeftCanvas />
        </div>

        <div className="rightPane">
          <Heading />

          {null}

          <div className="ctaRow">
            <GooeyNav
              items={navItems}
              initialActiveIndex={activeIndex}
              onItemClick={(item) => setLocation(item.href)}
            />
          </div>

          <Switch>
            <Route path="/about" component={About} />
            <Route path="/generative" component={Generative} />
            <Route path="/generative/:kind" component={Generative} />
            <Route path="/projects" component={Projects} />
            <Route path="/contact" component={Contact} />
            <Route path="/" component={Home} />
            <Route>
              <div className="kicker">
                <h3>Not found</h3>
                <p>Try one of the links above.</p>
              </div>
            </Route>
          </Switch>
          
          <div className="footer">
            <span>© {new Date().getFullYear()} CCDT Inc.</span>
            <a href="https://github.com/hamalfi-jp" target="_blank" rel="noreferrer">@NothingHam-jp</a>
          </div>
        </div>
      </div>
    </Router>
  )
}