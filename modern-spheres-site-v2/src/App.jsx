import React, { useState } from 'react'
import { Route, Switch, Link, useLocation } from 'wouter'
import SpheresCanvas from './Spheres.jsx'
import GridMorphCanvas from './GridMorph.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/Contact.jsx'

function Heading() {
  const [location] = useLocation()
  const titleMap = {
    '/': 'Modern Motion & Clear Messaging',
    '/about': 'About This Demo',
    '/projects': 'Selected Projects',
    '/contact': 'Get in Touch'
  }
  return (
    <>
      <span className="brand">Demo • React + Three</span>
      <h1 className="title">{titleMap[location] ?? 'Modern Motion & Clear Messaging'}</h1>
      <p className="subtitle">
        Left: <strong>multi-sphere animation</strong> with subtle refraction, motion, and soft shadows.
        Right: <strong>explanatory text</strong> that you can replace with your own content and <strong>links</strong> to multiple pages.
      </p>
    </>
  )
}

export default function App() {
  const [mode, setMode] = useState('spheres')
  return (
    <div className="app">
      <div className="leftPane">
        {mode === 'spheres' ? <SpheresCanvas /> : <GridMorphCanvas />}
      </div>

      <div className="rightPane">
        <Heading />

        <div className="ctaRow" style={{marginTop: 0}}>
          <span className="button" onClick={() => setMode('spheres')} style={{cursor:'pointer', opacity: mode==='spheres'?1:0.7}}>Animation: Spheres</span>
          <span className="button" onClick={() => setMode('grid')} style={{cursor:'pointer', opacity: mode==='grid'?1:0.7}}>Animation: Grid Morph</span>
        </div>

        <div className="ctaRow">
          <Link to="/" className="button primary">Home</Link>
          <Link to="/about" className="button">About</Link>
          <Link to="/projects" className="button">Projects</Link>
          <Link to="/contact" className="button">Contact</Link>
        </div>

        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/projects" component={Projects} />
          <Route path="/contact" component={Contact} />
          <Route> {/* 404 */}
            <div className="kicker">
              <h3>Not found</h3>
              <p>Try one of the links above.</p>
            </div>
          </Route>
        </Switch>

        <div className="footer">
          <span>© {new Date().getFullYear()} Your Name</span>
          <a href="https://github.com/pmndrs/react-three-fiber" target="_blank" rel="noreferrer">react-three-fiber</a>
          <a href="https://github.com/pmndrs/drei" target="_blank" rel="noreferrer">@react-three/drei</a>
        </div>
      </div>
    </div>
  )
}