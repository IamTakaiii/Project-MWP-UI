# Tech Stack

## Runtime & Build
- **Runtime**: Bun
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9

## Frontend Framework
- **React 19** with StrictMode
- **TanStack Router** for file-based routing
- **Tailwind CSS 4** with `@tailwindcss/vite` plugin

## UI Components
- **shadcn/ui** (new-york style) - components in `src/components/ui/`
- **Radix UI** primitives (checkbox, label, select, slot)
- **Lucide React** for icons
- **class-variance-authority** + **clsx** + **tailwind-merge** for styling

## Utilities
- **date-fns** for date manipulation

## Backend (Dev Server)
- Custom Vite plugin for SSE proxy (`vite.config.ts`)
- Express server for production (`server.js`)

## Common Commands

```bash
# Development
bun run dev          # Start dev server on port 5174

# Build
bun run build        # TypeScript check + Vite build

# Lint
bun run lint         # ESLint

# Preview production build
bun run preview
```

## Path Aliases
- `@/*` maps to `./src/*`
