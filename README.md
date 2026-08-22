# CodeSage — AI-Assisted Code Review Platform

CodeSage is a full-stack web app that brings a VS Code-style editor into the browser and layers it on top of live GitHub data — repo file trees, pull requests, and diffs — with lightweight static-analysis and real-time collaborative presence.

It's built as a **demo / proof-of-concept**, not a production tool: the "AI" review scores are currently simulated (see [Current Limitations](#current-limitations) below), and there's no auth or persistence layer yet.

---

## What it does

- **Browse a GitHub repo** by owner/name — fetches the real file tree, PRs, and issue/star counts via the GitHub REST API.
- **View and diff code** in an embedded Monaco Editor (the engine behind VS Code), including PR file diffs.
- **Static security scanning** — a regex-based scanner (running client-side) flags patterns like hardcoded secrets, SQL injection via string interpolation, and unsafe `pickle` usage, with inline suggestions and confidence scores.
- **Code structure visualization** — a lightweight parser extracts imports/functions/classes from a file and renders them as a dependency graph (D3 / React Flow).
- **Real-time presence** — Socket.IO broadcasts who's viewing a repo and live cursor positions, for a shared-review feel.

---

## Tech Stack

### Backend (`Backend/`)
- **Runtime:** Node.js, Express 5 (ES Modules)
- **Real-time:** Socket.IO
- **HTTP client:** Axios (proxies the GitHub REST API)
- **Other:** CORS, dotenv, Nodemon (dev)

### Frontend (`Frontend/`)
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Editor:** Monaco Editor (`@monaco-editor/react`)
- **State:** Zustand (UI state), TanStack Query (server state), Valtio
- **Visualization:** D3.js, React Flow
- **UI:** Tailwind CSS 4, Radix UI primitives, Framer Motion, Lucide icons
- **Real-time client:** Socket.IO client
- **Security:** DOMPurify (sanitizing rendered content)

---

## Project Structure

```
cicd/
├── Backend/
│   ├── server.js       # Express app — GitHub API proxy + analysis endpoints
│   ├── socket.js        # Socket.IO room/presence logic
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── app/                    # Next.js app router entry
    │   ├── components/
    │   │   ├── editor/             # Monaco editor wrapper
    │   │   ├── layout/              # Shell, command palette
    │   │   ├── panel/               # AI insights, review timeline, voice feedback UI
    │   │   ├── sidebar/             # File tree
    │   │   ├── ui/                  # Shared UI primitives
    │   │   └── views/               # GitHub view, PR diff view, AST viewer, repo analysis
    │   ├── services/
    │   │   ├── analysisEngine.ts    # Regex-based static analysis + structure extraction
    │   │   └── socketService.ts     # Socket.IO client wrapper
    │   ├── store/useStore.ts        # Zustand global UI state
    │   └── lib/                     # Security helpers, misc utilities
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/` (optional but recommended — raises GitHub's API rate limit from 60 to 5,000 requests/hour):
```
PORT=5000
GITHUB_TOKEN=your_github_personal_access_token
```

Run it:
```bash
npm run dev     # development, with nodemon
npm start       # production
```

### Frontend setup
```bash
cd Frontend
npm install
npm run dev     # development
# or
npm run build && npm start   # production
```

By default the frontend expects the backend at `http://localhost:5000`.

---

## API Overview (Backend)

| Endpoint | Description |
|---|---|
| `GET /api/github/tree/:owner/:repo` | Recursive file tree for the repo's default branch |
| `GET /api/github/prs/:owner/:repo` | List pull requests |
| `GET /api/github/pr-files/:owner/:repo/:prNumber` | File-level diffs for a PR |
| `GET /api/github/file/:owner/:repo` | Raw file content by path |
| `GET /api/github/file-content/:owner/:repo/:sha` | File content by blob SHA |
| `GET /api/github/metrics/:owner/:repo` | Stars, open issues, PR count, language |
| `GET /api/github/user-repos/:username` | Repos for a user (falls back to mock data if rate-limited) |
| `POST /api/analysis/scan` | Simulated repo-level quality/vulnerability scan |
| `POST /api/analysis/pr-review` | Simulated PR review with per-file issue flags |

Real-time events (Socket.IO): `join-room`, `cursor-move`, `room-occupancy`.

---

## Current Limitations

Being upfront about where this stands today:

- **The backend "AI" analysis is simulated.** `/api/analysis/scan` and `/api/analysis/pr-review` return randomized scores and pattern-based mock findings, not real ML inference. The one piece of *real* static analysis is `analysisEngine.ts` on the frontend, which does genuine regex-based pattern matching for a handful of security smells.
- **No authentication or persistence.** Everything is session-based and in-memory; there's no database or user accounts yet.
- **GitHub API rate limits apply** without a `GITHUB_TOKEN` (60 requests/hour, unauthenticated).
- Some file paths in local-file endpoints assume a specific local dev environment and aren't portable across machines yet.

---

## Roadmap Ideas

- Replace the mocked analysis endpoints with a real static-analysis pass (e.g., an AST-based scanner using a proper parser rather than regex) or a genuine ML/LLM-backed review.
- Add authentication (GitHub OAuth) and persist review state.
- Expand the security pattern library and add language-aware AST parsing for the structure/dependency graph view.

---

## License

No license specified yet — add one (MIT, Apache-2.0, etc.) if you intend for others to use or contribute to this project.