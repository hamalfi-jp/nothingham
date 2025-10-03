import React from 'react'
import { Route, Switch, Link, useLocation, Router } from 'wouter'
import SpheresCanvas from './Spheres.jsx'
import DensityCubeCanvas from './density_cube3D.jsx'
import GridMorphCanvas from './GridMorph.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import Contact from './pages/Contact.jsx'
import Generative from './pages/Generative.jsx'

function Heading() {
  const [location] = useLocation()
  const titleMap = {
    '/': 'Nothingham Team',
    // '/about': 'About ColorLyst',
    // '/projects': 'Selected Projects',
    // '/contact': 'Get in Touch'
  }
  return (
    <>
      <span className="brand">ColorLyst inc.</span>
      <h1 className="title">{titleMap[location] ?? 'Nothingham Team'}</h1>
      <p className="subtitle">
        The web serves both as the graveyard of innumerable ideas and the scrapbook that links disparate points; 
        this, in essence, is its nature. - Niao.
      </p>
    </>
  )
}

export default function App() {
  const [location] = useLocation()
  const LeftCanvas =
    location.startsWith('/generative/spheres') ? SpheresCanvas :
    location.startsWith('/generative/density') ? DensityCubeCanvas :
    location.startsWith('/generative/grid') ? GridMorphCanvas :
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
            <Link to="/" className={`button ${location==='/' ? 'primary' : ''}`}>Home</Link>
            <Link to="/projects" className={`button ${location==='/projects' ? 'primary' : ''}`}>Projects</Link>
            <Link to="/generative" className={`button ${location.startsWith('/generative') ? 'primary' : ''}`}>Generative</Link>
            <Link to="/about" className={`button ${location==='/about' ? 'primary' : ''}`}>About</Link>
            <Link to="/contact" className={`button ${location==='/contact' ? 'primary' : ''}`}>Contact</Link>
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
            <span>© {new Date().getFullYear()} ColorLyst inc.</span>
            <a href="https://github.com/hamalfi-jp" target="_blank" rel="noreferrer">@hamalfi-jp</a>
          </div>
        </div>
      </div>
    </Router>
  )
}