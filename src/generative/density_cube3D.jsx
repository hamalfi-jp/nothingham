import React, { useEffect, useRef } from 'react'

// React wrapper that mounts a p5.js instance replicating 3d_noise2.html
export default function SpheresCanvas() {
  const containerRef = useRef(null)
  const hudRef = useRef(null)
  const errRef = useRef(null)

  useEffect(() => {
    let p5Instance = null
    let cancelled = false

    const containerEl = containerRef.current
    if (!containerEl) return

    // Dynamically load p5 from CDN with a safe fallback.
    function loadP5() {
      return new Promise((resolve, reject) => {
        if (window.p5) return resolve()
        const primary = document.createElement('script')
        primary.src = 'https://cdn.jsdelivr.net/npm/p5@1.9.2/lib/p5.min.js'
        primary.async = true
        primary.onload = () => resolve()
        primary.onerror = () => {
          // Fallback CDN
          const fallback = document.createElement('script')
          fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js'
          fallback.async = true
          fallback.onload = () => resolve()
          fallback.onerror = () => reject(new Error('Failed to load p5.js'))
          document.head.appendChild(fallback)
        }
        document.head.appendChild(primary)
      })
    }

    function whenP5Ready(timeoutMs = 8000) {
      const start = performance.now()
      return new Promise((resolve, reject) => {
        (function check() {
          if (window.p5) return resolve()
          if (performance.now() - start > timeoutMs) return reject(new Error('p5.js failed to load'))
          setTimeout(check, 50)
        })()
      })
    }

    function updateHUD(lines) {
      if (hudRef.current) hudRef.current.textContent = lines.join('\n')
    }

    function showError(msg) {
      if (errRef.current) {
        errRef.current.style.display = 'block'
        errRef.current.textContent = msg
      }
      // eslint-disable-next-line no-console
      console.error(msg)
    }

    function sketchFactory() {
      const sketch = (p) => {
        // ---- Config copied/ported from 3d_noise2.html ----
        let seed = Math.random() * 1247
        let useWebgl = true

        const PALETTES = [
          ['#0b0f2a', '#1a237e', '#536dfe', '#f94144', '#fdc4c4'],
          ['#00e5ff', '#00ff85', '#ff8e00', '#ff3d81', '#b967ff'],
          ['#f7faff', '#93c5fd', '#3b82f6', '#ff6b6b', '#ffc2c2'],
          ['#0b0f14', '#0057ff', '#4da3ff', '#ff1f4b', '#ff8fab'],
          ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'],
        ]

        let palette
        let t = 0.01
        let rez = 0.006
        let modeLabel = 'Booting…'

        function lerpPalette(palette, tval) {
          const n = palette.length
          if (n === 0) return p.color('#ffffff')
          if (n === 1) return p.color(palette[0])
          const u = p.constrain(tval, 0, 1) * (n - 1)
          const i0 = Math.floor(u)
          const i1 = Math.min(i0 + 1, n - 1)
          const f = u - i0
          const c0 = p.color(palette[i0])
          const c1 = p.color(palette[i1])
          return p.lerpColor(c0, c1, f)
        }

        function safeCreateCanvas() {
          const w = containerEl.clientWidth || window.innerWidth
          const h = containerEl.clientHeight || window.innerHeight
          try {
            p.createCanvas(w, h, p.WEBGL)
            useWebgl = true
            modeLabel = 'WEBGL'
          } catch (e) {
            p.createCanvas(w, h)
            useWebgl = false
            modeLabel = '2D fallback'
          }
        }

        p.setup = function () {
          p.pixelDensity(1)
          p.colorMode(p.HSB, 360, 100, 100, 1)
          p.randomSeed(seed)
          safeCreateCanvas()
          p.frameRate(60)
          palette = p.random(PALETTES)
          updateHUD(['Press S to save PNG'])
        }

        p.draw = function () {
          p.randomSeed(seed)
          p.background(0, 0, 0)

          const plus = 16
          p.strokeWeight(1)
          const tw = t + 0.5 * Math.sin(t * 0.5)
          const anchors = palette

          if (useWebgl) {
            p.translate(-p.width / 2, -p.height / 2, 0)
            p.ambientLight(50)

            for (let i = 0; i < p.width; i += plus) {
              for (let j = 0; j < p.height; j += plus) {
                const n = p.noise(i * rez + tw, j * rez + tw, p.frameCount * 0.01 + tw)
                const mix = p.constrain(n, 0, 1)
                const c = lerpPalette(anchors, mix)
                p.fill(c)
                p.stroke(p.lerpColor(c, p.color('#ffffff'), 0.35))
                p.push()
                p.translate(i, j, 0)
                if (n > 0.45) {
                  p.box(plus, plus, 80 * n)
                } else {
                  p.box(Math.max(plus * 0.3 * n, 2))
                }
                p.pop()
              }
            }
          } else {
            p.noStroke()
            for (let i = 0; i < p.width; i += plus) {
              for (let j = 0; j < p.height; j += plus) {
                const n = p.noise(i * rez + tw, j * rez + tw, p.frameCount * 0.01 + tw)
                const mix = p.constrain(n, 0, 1)
                const c = lerpPalette(anchors, mix)
                p.fill(c)
                const s = n > 0.45 ? plus : Math.max(plus * 0.3 * n, 2)
                p.rect(i, j, s, s)
              }
            }
          }

        	  t += 0.03

          updateHUD([
            'Press S to save PNG',
            `Mode: ${modeLabel}`,
            `seed: ${Math.floor(seed)}  t: ${t.toFixed(2)}  frame: ${p.frameCount}`,
          ])
        }

        p.windowResized = function () {
          const w = containerEl.clientWidth || window.innerWidth
          const h = containerEl.clientHeight || window.innerHeight
          p.resizeCanvas(w, h)
        }

        p.keyTyped = function () {
          if (p.key === 's' || p.key === 'S') {
            p.saveCanvas('3D-Noise-Boxes', 'png')
          }
        }
      }
      return sketch
    }

    ;(async () => {
      try {
        await loadP5()
        await whenP5Ready()
        if (cancelled) return
        const sketch = sketchFactory()
        p5Instance = new window.p5(sketch, containerEl)
      } catch (e) {
        showError(e.message || 'Failed to initialize p5 sketch')
      }
    })()

    return () => {
      cancelled = true
      if (p5Instance && typeof p5Instance.remove === 'function') {
        p5Instance.remove()
      }
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0 }}>
      <div ref={hudRef} style={{ position: 'absolute', left: 12, bottom: 12, color: '#bbb', font: '12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', background: 'rgba(0,0,0,0.35)', padding: '6px 8px', borderRadius: 6, whiteSpace: 'pre' }} />
      <div ref={errRef} style={{ position: 'absolute', left: 12, top: 12, color: '#fff', background: '#c0392b', padding: '8px 10px', borderRadius: 6, font: '13px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', display: 'none' }} />
    </div>
  )
}
