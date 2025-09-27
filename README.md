## Offset Dashboard

A small dashboard that displays carbon credits, supports searching/filtering, shows status badges, a details modal, and lets users download a retirement certificate (HTML) per credit.

### Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

### Build

```bash
npm run build
npm run preview
```

### Data source

- Credits are loaded from `public/credits.json`.

### Features

- Search by project name or UNIC ID
- Filter by vintage year
- Status badges: green for Active, gray for Retired
- Details modal with fields
- Download “Retirement Certificate” as a self-contained HTML file

### Reflection

- How did you decide what to show on the main page vs details?
  - Main page: essentials for scanning and comparison — `UNIC ID`, `Project`, `Vintage`, `Status`, plus actions. This optimizes for list navigation and quick filtering. Details like monospace ID, full project name, and badge styling are visible without overwhelming the list.
  - Details: same fields with clearer hierarchy and room for future expansion (e.g., registry, location). Modal avoids a full page transition and keeps context.

- What design choices did you make to keep it clean?
  - Flat table layout with generous spacing, muted borders, and compact controls.
  - Inline status badge component with semantic color use (green/gray) and high contrast.
  - Minimal global styles; inline styles in components keep dependencies zero and the bundle small.

- If the system had 10,000 credits, how would you keep the dashboard fast?
  - Client: virtualized table (e.g., `react-window`) to render only visible rows; debounce search; memoize derived lists; move filtering to Web Worker for large datasets.
  - Data: server-backed pagination and query filtering (e.g., `?q=&vintage=&status=`) with indexed fields; deliver compressed JSON; incremental streaming.
  - UX: show total counts and lightweight skeletons; keep actions row-local to avoid reflows.

### Deploy

- Any static host works (Vercel, Netlify, GitHub Pages). For GitHub Pages:
  1. `npm run build`
  2. Upload `dist/` to your host or configure GitHub Pages for the repo’s `dist` output.
