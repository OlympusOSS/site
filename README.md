# Demo

OAuth2 test application for the [OlympusOSS Identity Platform](https://github.com/OlympusOSS/platform).

Built with Next.js, TypeScript, and the [Canvas](https://github.com/OlympusOSS/canvas) design system.

---

## Screenshot

![Home](assets/home.png)

---

## What It Does

A working OAuth2 client that demonstrates the full Authorization Code flow against Ory Hydra. Lets you log in as either a customer or employee identity and inspect the resulting tokens.

- **Login via CIAM** — Authenticate as a customer through the CIAM Hydra → Hera flow
- **Login via IAM** — Authenticate as an employee through the IAM Hydra → Hera flow
- **Token inspection** — View decoded ID token claims, access token, scopes
- **Admin links** — Quick access to CIAM and IAM admin panels

---

## Prerequisites

- An [Ory Hydra](https://www.ory.sh/hydra/) instance with registered OAuth2 clients
- A [Hera](https://github.com/OlympusOSS/hera) instance for authentication + consent

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CIAM_HYDRA_URL` | CIAM Hydra public URL | `http://localhost:3102` |
| `NEXT_PUBLIC_IAM_HYDRA_URL` | IAM Hydra public URL | `http://localhost:4102` |
| `CIAM_CLIENT_ID` | CIAM OAuth2 client ID | `demo-ciam-client` |
| `CIAM_CLIENT_SECRET` | CIAM OAuth2 client secret | `demo-ciam-secret` |
| `IAM_CLIENT_ID` | IAM OAuth2 client ID | `demo-iam-client` |
| `IAM_CLIENT_SECRET` | IAM OAuth2 client secret | `demo-iam-secret` |
| `NEXT_PUBLIC_APP_URL` | Demo app base URL (used for redirect URIs) | `http://localhost:2000` |

---

## Getting Started

### Run locally

```bash
bun install
bun run dev
```

Open [http://localhost:2000](http://localhost:2000).

### Run with Docker

```bash
docker build -t demo .
docker run -p 2000:3000 \
  -e NEXT_PUBLIC_CIAM_HYDRA_URL=http://your-ciam-hydra:4444 \
  -e CIAM_CLIENT_ID=your-client-id \
  -e CIAM_CLIENT_SECRET=your-client-secret \
  -e NEXT_PUBLIC_APP_URL=http://localhost:2000 \
  demo
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home page — login buttons + session display |
| `/callback/ciam` | CIAM OAuth2 callback — exchanges code for tokens |
| `/callback/iam` | IAM OAuth2 callback — exchanges code for tokens |
| `/logout/ciam` | CIAM logout — clears session cookie |
| `/logout/iam` | IAM logout — clears session cookie |
| `/health` | Health check endpoint |

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15, React 19 |
| Language | TypeScript |
| Runtime | [Bun](https://bun.sh/) |
| Design System | [@olympusoss/canvas](https://github.com/OlympusOSS/canvas) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx            # Home page (auth cards + session display)
│   ├── callback/
│   │   ├── ciam/route.ts   # CIAM token exchange
│   │   └── iam/route.ts    # IAM token exchange
│   ├── logout/
│   │   ├── ciam/route.ts   # CIAM session clear
│   │   └── iam/route.ts    # IAM session clear
│   └── health/route.ts     # Health check
├── components/
│   ├── auth-card.tsx        # Login card component
│   ├── session-display.tsx  # Token claims viewer
│   ├── page-shell.tsx       # Header with branding
│   └── animated-background.tsx
└── styles/
    └── globals.css          # Canvas tokens + Tailwind
```

---

## License

MIT
