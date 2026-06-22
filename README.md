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

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OAUTH_CLIENT_ID=your_oauth_client_id
NEXT_PUBLIC_OAUTH_REDIRECT_URI=http://localhost:3000/callback
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Movelo backend | `http://localhost:8000` |
| `NEXT_PUBLIC_OAUTH_CLIENT_ID` | OAuth2 client ID registered on the backend | — |
| `NEXT_PUBLIC_OAUTH_REDIRECT_URI` | Redirect URI registered on the backend | `http://localhost:3000/callback` |

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

Auth uses **OAuth2 Authorization Code flow with PKCE** against the Movelo backend.

### Email / password login

1. `lib/auth.ts → login()` generates a PKCE code verifier + challenge.
2. Calls `POST /api/v1/auth/authorize/login` with credentials and the code challenge.
3. Receives an authorization code and exchanges it for tokens via `POST /api/v1/auth/token`.
4. Tokens are persisted in `localStorage`. Access tokens are silently refreshed 30 seconds before expiry.

### Google OAuth login

1. `loginWithGoogle()` stores the code verifier in `sessionStorage` and redirects to `GET /api/v1/auth/google`.
2. The backend redirects back to `/callback?code=...`.
3. `CallbackHandler` reads the code verifier from `sessionStorage` and completes the token exchange.

### Token helpers (`lib/auth.ts`)

| Export | Purpose |
|---|---|
| `login(email, password)` | Full PKCE login flow |
| `loginWithGoogle()` | Redirect to Google OAuth |
| `exchangeCodeFromCallback(code)` | Complete Google OAuth after redirect |
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