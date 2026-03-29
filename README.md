# Gastly

Monthly expense tracker built with React, TypeScript, and Supabase. Manage a personal budget, log expenses by category, close monthly periods, and export reports to PDF.

## Features

- **Authentication** — Email/password login and signup via Supabase Auth.
- **Monthly budget** — Set an initial amount and track spending, balance, and usage in real time.
- **Expense CRUD** — Create, edit, and delete entries with confirmation dialogs.
- **Categories** — BBVA, Supervielle, Préstamo, Servicios, Colegio, Otros — each with its own icon and color.
- **Installments** — Record payments in installments (e.g. 3/12) with dedicated numeric inputs.
- **Next-month plan** — Separate planned budget and expenses for the following calendar month; pull the next card installment rows from the last closed report; amounts stay out of the current ledger until you register them as current-month expenses.
- **Card USD / ARS** — For credit-card categories, enter the amount in pesos or in USD; USD uses the **dólar tarjeta** (sell) rate from the public [DolarApi](https://dolarapi.com) snapshot. Stored totals remain in ARS for budgets and sums; original USD and the rate used are kept for display.
- **Month close** — Snapshot the current period to Supabase and reset local data for the next cycle.
- **PDF export** — Generate a report with selected expenses, entirely client-side.
- **Share** — Send the PDF via WhatsApp or other apps using the Web Share API (mobile).
- **Dark mode** — Light and dark themes with localStorage persistence.
- **Accessibility** — Focus trap in modals, keyboard navigation, ARIA roles.
- **Code-splitting** — The jsPDF chunk (~430 KB) is loaded on demand only when generating a report.

## Tech Stack

- **UI** — [React 19](https://react.dev) + [TypeScript 5.9](https://www.typescriptlang.org)
- **Build** — [Vite 8](https://vite.dev)
- **Styles** — [TailwindCSS 4](https://tailwindcss.com)
- **State** — [Zustand 5](https://zustand.docs.pmnd.rs) with persist middleware
- **Server state / fetching** — [TanStack Query 5](https://tanstack.com/query) for HTTP data (e.g. FX quotes) with caching and stale times
- **Auth & DB** — [Supabase](https://supabase.com) (Auth + PostgreSQL with RLS)
- **PDF** — [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Toasts** — [Sonner](https://sonner.emilkowal.ski)
- **Icons** — [Hugeicons](https://hugeicons.com)
- **Math** — [big.js](https://github.com/MikeMcl/big.js) for financial precision
- **Linting** — ESLint 9 + Prettier

## Architecture

The project follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── core/               # Shared core logic
│   ├── date/           # Calendar helpers (e.g. plan month labels)
│   ├── expense/        # Planned installments / report → plan helpers
│   ├── math/           # Financial calculations, formatting, FX helpers
│   ├── storage/        # Persistence configuration
│   └── supabase/       # Supabase client
├── features/           # Business modules (barrel exports)
│   ├── auth/           # Authentication
│   ├── budget/         # Budget management
│   ├── dashboard/      # Main view
│   ├── exchange-rates/ # Public FX quotes (DolarApi) + React Query hooks
│   ├── expenses/       # Expense CRUD
│   └── reports/        # Month close, PDF, sharing
├── shared/             # Shared components and hooks
│   ├── hooks/          # useTheme, etc.
│   ├── query/          # QueryClient singleton
│   └── ui/             # Button, Modal, Icon, Spinner, etc.
├── store/              # Global Zustand store
└── types/              # Types and interfaces
```

Each feature exposes a **barrel export** (`index.ts`) as its public API. Internal components, hooks, and services remain encapsulated.

## Methodology: Spec-Driven Development

Development followed a **spec-driven development** approach using [Spec Kit](https://github.com/github/spec-kit) — a library that structures the process from research through implementation with formal specifications.

```
specs/001-expense-tracker-core/
├── spec.md             # Functional specification (user stories, acceptance criteria)
├── research.md         # Technical research (jsPDF, Web Share API, Zustand, etc.)
├── plan.md             # Implementation plan by phase
├── tasks.md            # Granular tasks with checklist
├── data-model.md       # Data model (types, store, DB)
├── quickstart.md       # Quick setup guide
├── contracts/
│   └── store.md        # Store contract (public interface)
└── checklists/
    └── requirements.md # Spec quality checklist
```

This ensures every feature is designed before coding, with full traceability from requirements to tasks to code.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io) >= 9
- A [Supabase](https://supabase.com) account (free tier)

### Setup

```bash
git clone https://github.com/FavioMagallanes/gastly.git
cd gastly
pnpm install
```

Create a `.env` file from the example and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the contents of `supabase/schema.sql` in the Supabase SQL Editor to create the required tables, then start the dev server:

```bash
pnpm dev
```

### Available Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `pnpm dev`          | Development server with HMR              |
| `pnpm build`        | Type-check + production build            |
| `pnpm lint`         | Run ESLint                               |
| `pnpm format`       | Format code with Prettier                |
| `pnpm format:check` | Check formatting without modifying files |
| `pnpm preview`      | Preview the production build             |

## Production Build

```bash
pnpm build
```

| Chunk                   | Size    | Gzip    | Loading |
| ----------------------- | ------- | ------- | ------- |
| `index.js` (app)        | ~480 KB | ~139 KB | Eager   |
| `report-pdf.js` (jsPDF) | ~430 KB | ~139 KB | Lazy    |
| `index.css`             | ~35 KB  | ~7 KB   | Eager   |

The PDF chunk is only downloaded when the user generates a report, keeping the main bundle lightweight.

## Database

The app uses Supabase with a `monthly_reports` table protected by **Row Level Security (RLS)**:

```sql
CREATE POLICY "Users can manage own reports"
  ON monthly_reports
  FOR ALL
  USING (auth.uid() = user_id);
```

See [`supabase/schema.sql`](./supabase/schema.sql) for the full schema.

Current-month expenses are persisted in **localStorage** (per-user key) via Zustand persist. They are saved to Supabase as an immutable snapshot only when the month is closed.

**External HTTP (optional UX):** The app may `GET` public JSON from [dolarapi.com](https://dolarapi.com) for **dólar tarjeta** only when you use a credit-card category and choose USD. No personal or amount data is sent in that request.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit using [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`)
4. Push to your branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT © [Favio Magallanes](https://github.com/FavioMagallanes)
