# Modern Spheres — Split Layout

Left half: animated spheres with a modern, glassy look (Three.js via `@react-three/fiber` & `@react-three/drei`).
Right half: explanatory text and links to multiple pages (SPA via `wouter`).

## Quick start

```bash
# 1) Install deps
npm install

# 2) Run dev server
npm run dev

# 3) Build for production
npm run build && npm run preview
```

### Notes

- The animation respects `prefers-reduced-motion` and will pause if the OS setting requests it.
- The layout is responsive: on narrow screens the canvas stacks on top.
- Style is plain CSS (no Tailwind), to avoid extra setup problems.