# 📚 Reading Buddy

![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Azure](https://img.shields.io/badge/Deployed_on-Azure_App_Service-0078D4?style=flat&logo=microsoftazure&logoColor=white)

> **Keep your leisure reading alive during busy semesters.**

Reading Buddy is a web app built for college students who want to stay on top of their personal reading without it feeling like another assignment. Log reading sessions, track books, set daily page goals, and visualize your progress — all in one warm, bookstore-inspired interface.

---

## ✨ Features

- 📖 **Log Reading** — Quickly record pages read with a quick log or a detailed session entry
- 🗂 **My Books** — Add and manage your reading list with progress tracking per book
- 🎯 **Reading Goals** — Set a daily page target and monitor your streak
- ⚙️ **Settings** — Customize your daily goal and reminder preferences
- 🌿 **Landing page** — A clean product page at `/` with a link to launch the tracker at `/app`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS, Playfair Display + Inter fonts |
| Backend | Node.js + Express 5 + TypeScript |
| Database | PostgreSQL via Supabase + Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API Contract | OpenAPI spec + Orval codegen |
| Monorepo | pnpm workspaces |
| Deployment | Azure App Service (Node.js 22 LTS) |

---

## 🚀 Running the Project Locally

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/) — install with `npm install -g pnpm`
- A PostgreSQL database (local or [Supabase](https://supabase.com))

### 1. Clone the repository

```bash
git clone https://github.com/miamaiers/miamaiers-reading-buddy.git
cd miamaiers-reading-buddy
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
CONNECTION_STRING=your_postgresql_connection_string_here
SESSION_SECRET=any_random_string_here
```

> If using Supabase, use the **Transaction Pooler** connection string (port `6543`) for best compatibility.

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 5. Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

### 6. Start the frontend (in a separate terminal)

```bash
pnpm --filter @workspace/reading-buddy run dev
```

The app will be available at the port shown in your terminal.

---

## 📁 Project Structure

```
├── artifacts/
│   ├── api-server/        # Express REST API
│   └── reading-buddy/     # React + Vite frontend
├── lib/
│   ├── api-client-react/  # Auto-generated React Query hooks
│   ├── api-spec/          # OpenAPI specification
│   ├── api-zod/           # Auto-generated Zod schemas
│   └── db/                # Drizzle ORM schema + database client
└── scripts/               # Utility scripts
```

---

## 🔑 Useful Commands

| Command | Description |
|---|---|
| `pnpm run typecheck` | Full TypeScript check across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push schema changes to the database |

---

## ☁️ Deployment

The app is deployed to **Azure App Service** via GitHub Actions. Every push to `main` triggers an automatic build and deploy.

Make sure these environment variables are set in **Azure App Service → Configuration → Application settings**:

- `CONNECTION_STRING` — Supabase Transaction Pooler connection string
- `SESSION_SECRET` — A secure random string
- `NODE_ENV` — Set to `production`

---

*Built with care for readers who just need a little extra encouragement to keep turning pages.* 📖
