# Movelo Frontend

Frontend for the Movelo delivery platform — built with Next.js 16, React 19, and Tailwind CSS v4.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) |
| Icons | Lucide React |
| Language | TypeScript 5 |
| Font | Inter (via `next/font/google`) |

---

## Prerequisites

- Node.js 20+
- npm 10+
- A running instance of the [Movelo backend](http://localhost:8000) (for auth and API calls)

---

## Environment Variables

Create a `.env.local` file in the project root.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start the production server (requires a prior build) |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
movelo-frontend/
├── app/
│   ├── (dashboard)/          # Authenticated layout group
│   │   ├── layout.tsx        # Dashboard shell (auth guard)
│   │   └── dashboard/
│   │       ├── page.tsx      # Dashboard home
│   │       └── profile/      # Profile view & edit
│   ├── callback/             # OAuth2 redirect handler
│   ├── login/                # Login page
│   ├── signup/               # Sign-up page
│   ├── email-verified/       # Post-verification success screen
│   ├── email-verification-failed/
│   ├── globals.css           # Tailwind imports + design system tokens
│   └── layout.tsx            # Root layout (fonts, metadata)
├── lib/
│   ├── auth.ts               # Auth helpers: login, logout, PKCE, token storage
│   └── profile.ts            # Profile API calls
├── DESIGN_SYSTEM.md          # Component & token reference
└── AGENTS.md                 # AI agent instructions
```

---

## Authentication

Auth uses **OAuth2 Authorization Code flow with PKCE** against the Movelo backend. The frontend never handles credentials — the backend auth server owns the login UI (email/password and Google OAuth).

### Login flow

1. `initiateLogin()` generates a PKCE code verifier + challenge, stores the verifier in `sessionStorage`, and redirects to `GET /auth/authorize` on the backend.
2. The backend auth server handles login (email/password or Google OAuth) and redirects back to `/callback?code=...`.
3. `exchangeCodeFromCallback(code)` reads the verifier from `sessionStorage` and exchanges the code for tokens via `POST /auth/token`.
4. Tokens are persisted in `localStorage`. Access tokens are silently refreshed 30 seconds before expiry.

### Token helpers (`lib/auth.ts`)

| Export | Purpose |
|---|---|
| `initiateLogin()` | Generate PKCE params and redirect to backend auth server |
| `exchangeCodeFromCallback(code)` | Complete token exchange after redirect |
| `logout()` | Revoke refresh token, clear storage |
| `getValidAccessToken()` | Return a valid access token, refreshing if needed |
| `getAuthUser()` | Decode JWT and return `{ userId, email }` |

---

## Design System

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full component and token reference.

Quick summary:

- **Primary color:** `#FF6B00` (orange) — use only for the main action per view
- **Components:** `btn`, `card`, `input`, `badge`, `info-pill`, `bottom-action-bar`
- **Typography:** semantic classes (`text-title-1` → `text-caption`) over raw Tailwind utilities
- **Mobile-first:** always write base styles for mobile, add `sm:`/`md:`/`lg:` only when the layout changes