import React, { useEffect, useRef } from 'react'

export default function DropletNodesCanvas() {
  const containerRef = useRef(null)
  const p5Instance = useRef(null)

  useEffect(() => {
    // Dynamically load p5.js
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/p5@1.10.0/lib/p5.min.js'
    script.async = true
    script.onload = () => {
      // Initialize p5 sketch after library loads
      if (window.p5 && containerRef.current) {
        const sketch = (p) => {
          // Parameters
          const P = {
            N: 2000,
            Rscale: 0.35,
            radialBias: 1,
            minSpacing: 60,
            placeGridCell: 10.5,
            dX: 1.0,
            boostCheck: 18,
            boostFactor: 1.5,
            sliceEps: 0,
            betaR: 0.07,
            betaT: 0.03,
            floatDrag: 0.94,
            noiseFreq1: 0.002,
            noiseAmp1: 0.45,
            noiseFreq2: 0.007,
            noiseAmp2: 0.18,
            kickProb: 0.012,
            kickMag: 2,
            wallClamp: 0.995,
            linkMin: 10,
            linkOn: 35,
            linkOffFactor: 2.5,
            maxDegree: 3,
            rebuildEvery: 8,
            linkGridCell: 30,
            tubeR: 0.8,
            tubeDetail: 4,
            edgeShortCut: 12,
            drawEdgeSkip: 3,
            cubeSkip: 1,
            showSphere: false,
            showXLine: false
          }

          let R, dx
          let anchors = [], nodes = []
          let linked = new Set(), edges = []
          let framesSinceRebuild = 0, framesNoNew = 0, paused = false, phase = "RUN"
          let placeGrid, linkGrid
          let originX = 0
          let pendingPick = false, pickX = 0, pickY = 0
          let paletteMode = 0

          // Grid3D class
          class Grid3D {
            constructor(cell) {
              this.c = cell
              this.m = new Map()
            }
            key(v) {
              const c = this.c
              return `${Math.floor(v.x / c)}|${Math.floor(v.y / c)}|${Math.floor(v.z / c)}`
            }
            clear() {
              this.m.clear()
            }
            put(i, v) {
              const k = this.key(v)
              if (!this.m.has(k)) this.m.set(k, [])
              this.m.get(k).push(i)
            }
            neigh(v) {
              const c = this.c
              const ix = Math.floor(v.x / c)
              const iy = Math.floor(v.y / c)
              const iz = Math.floor(v.z / c)
              const out = []
              for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                  for (let dz = -1; dz <= 1; dz++) {
                    const k = `${ix + dx}|${iy + dy}|${iz + dz}`
                    if (this.m.has(k)) out.push(...this.m.get(k))
                  }
                }
              }
              return out
            }
          }

          function getContainerSize() {
            const el = containerRef.current
            const w = el ? el.clientWidth : window.innerWidth
            const h = el ? el.clientHeight : window.innerHeight
            return { w, h }
          }

          p.setup = () => {
            const { w, h } = getContainerSize()
            p.createCanvas(w, h, p.WEBGL)
            p.pixelDensity(1)
            p.colorMode(p.HSB, 360, 100, 100, 100)
            resetAll()
          }

          p.windowResized = () => {
            const { w, h } = getContainerSize()
            p.resizeCanvas(w, h)
            resetAll()
          }

          function resetAll() {
            anchors.length = 0
            nodes.length = 0
            linked.clear()
            edges.length = 0
            framesSinceRebuild = 0
            framesNoNew = 0
            phase = "RUN"
            paused = false
            originX = 0

            R = Math.floor(p.min(p.width, p.height) * P.Rscale)
            dx = -R

            placeGrid = new Grid3D(P.placeGridCell)
            const seedAnchor = p.createVector(-R * 0.99, 0, 0)
            anchors.push(seedAnchor.copy())
            placeGrid.put(0, seedAnchor)

            let attempts = 0, limit = P.N * 200
            while (anchors.length < P.N && attempts < limit) {
              attempts++
              const u = p.random()
              const r = R * p.pow(u, P.radialBias)
              const cand = p5.Vector.random3D().mult(r)
              if (cand.mag() > R * P.wallClamp) continue
              if (!acceptAnchor(cand)) continue
              anchors.push(cand.copy())
              placeGrid.put(anchors.length - 1, cand)
            }
            while (anchors.length < P.N) {
              anchors.push(p5.Vector.random3D().mult(R * p.pow(p.random(), P.radialBias)))
            }

            for (let i = 0; i < P.N; i++) {
              const a = anchors[i]
              const rf = p.constrain(a.mag() / R, 0, 1)
              const base = paletteHSB(p.pow(rf, 0.9))
              const hue = (base.h + p.random(-6, 6) + 360) % 360
              const sat = p.constrain(base.s + p.random(-4, 4), 0, 100)
              const bri = p.constrain(base.b + p.random(-3, 3), 0, 100)
              nodes.push({
                a, p: a.copy(),
                v: p.createVector(0, 0, 0),
                seed: p.random(1000),
                size: p.random(6, 14),
                col: { h: hue, s: sat, b: bri },
                rot: p.random(p.TAU),
                active: (i === 0),
                birth: (i === 0) ? p.frameCount : 0
              })
            }
          }

          function acceptAnchor(pos) {
            const neigh = placeGrid.neigh(pos)
            for (const i of neigh) {
              if (pos.dist(anchors[i]) < P.minSpacing) return false
            }
            return true
          }

          function updateReveal() {
            let newly = 0
            const threshold = dx + P.sliceEps
            for (let i = 0; i < nodes.length; i++) {
              const n = nodes[i]
              if (n.active) continue
              if (n.a.x <= threshold) {
                n.active = true
                n.birth = p.frameCount
                newly++
              }
            }
            if (newly === 0) framesNoNew++
            else framesNoNew = 0
            const step = (framesNoNew >= P.boostCheck) ? P.dX * P.boostFactor : P.dX
            dx += step
            if (dx >= R) {
              dx = R
              phase = "DONE"
            }
          }

          function updateFloating() {
            const t1 = p.frameCount * P.noiseFreq1
            const t2 = p.frameCount * P.noiseFreq2

            for (const n of nodes) {
              if (!n.active) continue

              const a = n.a, pos = n.p
              const d = p5.Vector.sub(a, pos)
              const ur = a.copy().normalize()
              const dr = ur.copy().mult(d.dot(ur))
              const dtan = d.copy().sub(dr)
              const anchorForce = dr.mult(P.betaR).add(dtan.mult(P.betaT))

              const nx1 = p.noise(n.seed + 0.31 + t1) - 0.5
              const ny1 = p.noise(n.seed + 1.71 + t1) - 0.5
              const nz1 = p.noise(n.seed + 3.47 + t1) - 0.5
              const nx2 = p.noise(n.seed + 4.99 + t2) - 0.5
              const ny2 = p.noise(n.seed + 7.37 + t2) - 0.5
              const nz2 = p.noise(n.seed + 9.13 + t2) - 0.5
              const drive = p.createVector(
                nx1 * P.noiseAmp1 + nx2 * P.noiseAmp2,
                ny1 * P.noiseAmp1 + ny2 * P.noiseAmp2,
                nz1 * P.noiseAmp1 + nz2 * P.noiseAmp2
              )

              if (p.random() < P.kickProb) {
                const kick = p5.Vector.random3D().mult(P.kickMag)
                n.v.add(kick)
              }

              n.v.mult(P.floatDrag).add(anchorForce).add(drive)
              pos.add(n.v)

              const rMax = R * P.wallClamp
              if (pos.mag() > rMax) {
                pos.setMag(rMax)
                n.v.mult(0.4)
              }
            }
          }

          function rebuildEdges() {
            framesSinceRebuild = 0
            edges.length = 0

            const d_on = P.linkOn
            const d_off = P.linkOn * P.linkOffFactor
            const d_min = P.linkMin

            const keep = new Set()
            const deg = new Array(nodes.length).fill(0)
            for (const key of linked) {
              const [is, js] = key.split('|')
              const i = +is, j = +js
              if (!(nodes[i].active && nodes[j].active)) continue
              const L = p5.Vector.dist(nodes[i].p, nodes[j].p)
              if (L >= d_off || L < d_min) continue
              keep.add(key)
              edges.push([i, j])
              deg[i]++
              deg[j]++
            }
            linked = keep

            linkGrid = new Grid3D(P.linkGridCell)
            const actIdx = []
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].active) {
                linkGrid.put(i, nodes[i].p)
                actIdx.push(i)
              }
            }
            for (const i of actIdx) {
              if (deg[i] >= P.maxDegree) continue
              const pi = nodes[i].p
              const neigh = linkGrid.neigh(pi)
              for (const j of neigh) {
                if (j <= i) continue
                if (!nodes[j].active) continue
                if (deg[i] >= P.maxDegree || deg[j] >= P.maxDegree) continue
                const key = i + "|" + j
                if (linked.has(key)) continue
                const L = p5.Vector.dist(pi, nodes[j].p)
                if (L > d_on || L < d_min) continue
                linked.add(key)
                edges.push([i, j])
                deg[i]++
                deg[j]++
              }
            }
          }

          p.draw = () => {
            p.background(220, 25, 4)
            p.orbitControl(1.0, 1.0, 0.25)
            p.rotateY(-p.millis() * 0.000012)

            p.ambientLight(220, 12, 20)
            p.directionalLight(220, 20, 95, -0.35, -0.7, -0.25)
            p.directionalLight(260, 28, 85, 0.6, 0.2, 0.7)
            p.pointLight(230, 18, 70, 0, -R * 0.6, R * 0.8)

            if (pendingPick) {
              const nx = (pickX / p.width) * 2 - 1
              originX = nx * R
              dx = originX
              phase = 'RUN'
              let nm = p.floor(p.random(4))
              if (nm === paletteMode) nm = (paletteMode + 1) % 4
              paletteMode = nm
              for (const n of nodes) {
                const rf = p.constrain(n.a.mag() / R, 0, 1)
                const base = paletteHSB(p.pow(rf, 0.9))
                n.col = {
                  h: (base.h + p.random(-6, 6) + 360) % 360,
                  s: p.constrain(base.s + p.random(-4, 4), 0, 100),
                  b: p.constrain(base.b + p.random(-3, 3), 0, 100)
                }
                n.active = false
              }
              pendingPick = false
            }

            if (!paused) {
              if (phase !== "DONE") updateReveal()
              updateFloating()
              framesSinceRebuild++
              if (framesSinceRebuild >= P.rebuildEvery) rebuildEdges()
            }

            if (P.showSphere) {
              p.push()
              p.noFill()
              p.stroke(220, 12, 65, 22)
              p.strokeWeight(1)
              p.sphere(R)
              p.pop()
            }
            if (P.showXLine) {
              p.push()
              p.stroke(200, 12, 95, 35)
              p.strokeWeight(2)
              p.line(dx, -R * 1.05, 0, dx, R * 1.05, 0)
              p.pop()
            }

            p.noStroke()
            for (let ei = 0; ei < edges.length; ei += P.drawEdgeSkip) {
              const [i, j] = edges[ei]
              const A = nodes[i].p
              const B = nodes[j].p
              const L = p5.Vector.dist(A, B)
              if (L < P.edgeShortCut) continue
              const ti = p.constrain(nodes[i].a.mag() / R, 0, 1)
              const tj = p.constrain(nodes[j].a.mag() / R, 0, 1)
              const tm = (ti + tj) * 0.5
              const ec = paletteHSB(tm)
              drawTube(A, B, P.tubeR, p.color(ec.h, ec.s * 0.2, 96, 28))
            }

            for (let i = 0; i < nodes.length; i += P.cubeSkip) {
              const n = nodes[i]
              if (!n.active) continue
              const age = p.frameCount - n.birth
              const sFactor = (age < 16) ? p.map(age, 0, 16, 0, 1) : 1
              p.push()
              p.translate(n.p.x, n.p.y, n.p.z)
              p.rotateY(n.rot + p.frameCount * 0.02)
              p.rotateX(n.rot * 0.7 + p.frameCount * 0.016)
              const cubeCol = p.color(n.col.h, n.col.s, n.col.b, 92)
              p.ambientMaterial(cubeCol)
              p.specularMaterial(0, 0, 18)
              p.shininess(8)
              p.scale(sFactor)
              p.box(n.size)
              p.pop()
            }
          }

          function paletteName() {
            if (paletteMode === 0) return 'Seismic'
            if (paletteMode === 1) return 'Twilight'
            if (paletteMode === 2) return 'PiYG'
            if (paletteMode === 3) return 'Spectral'
            return 'Unknown'
          }

          function paletteHSB(rf) {
            if (paletteMode === 0) return seismicHSB(rf)
            if (paletteMode === 1) return twilightShiftedHSB(rf)
            if (paletteMode === 2) return piYgHSB(rf)
            return spectralHSB(rf)
          }

          function seismicHSB(rf) {
            const x = p.constrain(rf, 0, 1)
            const mid = 0.46
            if (x < mid) {
              const u = p.pow(x / mid, 1.4)
              const h = 215
              const s = p.lerp(90, 8, u)
              const b = p.lerp(85, 100, p.pow(u, 1.2))
              return { h, s, b }
            } else {
              const u = p.pow((x - mid) / (1.0 - mid), 0.8)
              const h = 0
              const s = p.lerp(8, 96, u)
              const b = p.lerp(100, 92, u)
              return { h, s, b }
            }
          }

          function twilightShiftedHSB(rf) {
            const x = p.constrain(rf, 0, 1)
            const h = p.lerp(210, 285, p.pow(x, 0.9))
            const s = p.lerp(18, 40, x)
            const b = p.lerp(98, 90, p.pow(x, 1.1))
            return { h, s, b }
          }

          function piYgHSB(rf) {
            const x = p.constrain(rf, 0, 1)
            if (x < 0.5) {
              const u = x / 0.5
              const h = 330
              const s = p.lerp(60, 0, u)
              const b = p.lerp(92, 100, u)
              return { h, s, b }
            } else {
              const u = (x - 0.5) / 0.5
              const h = 130
              const s = p.lerp(0, 65, u)
              const b = p.lerp(100, 95, u)
              return { h, s, b }
            }
          }

          function spectralHSB(rf) {
            const x = p.constrain(rf, 0, 1)
            if (x < 0.5) {
              const u = x / 0.5
              const h = 220
              const s = p.lerp(70, 0, u)
              const b = p.lerp(90, 100, u)
              return { h, s, b }
            } else {
              const u = (x - 0.5) / 0.5
              const h = 25
              const s = p.lerp(0, 85, u)
              const b = p.lerp(100, 95, u)
              return { h, s, b }
            }
          }

          function drawTube(a, b, r, col) {
            const d = p5.Vector.sub(b, a)
            const L = d.mag()
            if (L < 0.001) return
            const mid = p5.Vector.add(a, b).mult(0.5)
            const up = p.createVector(0, 1, 0)
            const nd = d.copy().mult(1 / L)
            let axis = up.cross(nd)
            let m = axis.mag()
            let ang = 0
            if (m > 1e-6) {
              axis.mult(1 / m)
              ang = p.acos(p.constrain(up.dot(nd), -1, 1))
            }
            p.push()
            p.translate(mid.x, mid.y, mid.z)
            if (ang !== 0) p.rotate(ang, axis)
            p.ambientMaterial(col)
            p.specularMaterial(0, 0, 92)
            p.shininess(10)
            p.cylinder(r, L, P.tubeDetail, 1, true, true)
            p.pop()
          }

          p.keyPressed = () => {
            if (p.key === ' ') paused = !paused
            if (p.key === 'r' || p.key === 'R') resetAll()
          }

          p.mousePressed = () => {
            pickX = p.mouseX
            pickY = p.mouseY
            pendingPick = true
          }
        }

        p5Instance.current = new window.p5(sketch, containerRef.current)
      }
    }
    document.head.appendChild(script)

    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove()
        p5Instance.current = null
      }
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    />
  )
}
