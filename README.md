<!-- changes done by vb: README rewritten for PseudoTeam (old setup text and links removed) -->

# PseudoTeam — Customer Portal (Frontend)

React + TypeScript + Vite + Tailwind customer portal for PseudoTeam: dashboard, project tracking
(locations → milestones → tasks), critical spares, tickets, orders and calendar.

It talks to the PseudoTeam Python (FastAPI) backend in `../pseudoteam-pybackend`.

## Run locally

**Prerequisites:** Node.js 18+ and the PseudoTeam backend running (default `http://127.0.0.1:8000`).

1. Install dependencies:
   `npm install`
2. (Optional) Point the app at a different backend by creating `.env.local` from `.env.example`
   and setting `VITE_API_BASE_URL`.
3. Start the dev server:
   `npm run dev`
4. Open http://localhost:3000

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check with TypeScript |
# FrontendPT2026
