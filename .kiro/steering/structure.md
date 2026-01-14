# Project Structure

```
src/
├── main.tsx              # App entry point
├── router.tsx            # TanStack Router configuration
├── index.css             # Global styles (Tailwind)
│
├── components/           # React components
│   ├── ui/               # shadcn/ui primitives (button, input, select, etc.)
│   ├── *.tsx             # Feature components
│   └── index.ts          # Barrel export
│
├── pages/                # Route page components
│   ├── home.tsx          # Landing/app selector
│   ├── worklog.tsx       # Main worklog creation page
│   ├── history.tsx       # Worklog history viewer
│   ├── sse-monitor.tsx   # SSE debugging tool
│   └── index.ts          # Barrel export
│
├── hooks/                # Custom React hooks
│   ├── use-local-storage.ts
│   ├── use-worklog.ts    # Worklog creation logic
│   ├── use-tasks.ts      # Task fetching/filtering
│   ├── use-worklog-history.ts
│   ├── use-sse.ts        # SSE connection hook
│   └── index.ts          # Barrel export
│
├── services/             # API layer
│   ├── api/              # Base HTTP client
│   │   ├── client.ts     # ApiClient class with error handling
│   │   ├── config.ts     # Service configuration
│   │   └── index.ts
│   ├── jira/             # Jira-specific service
│   │   ├── jira.service.ts
│   │   ├── jira.types.ts
│   │   └── index.ts
│   ├── auth.service.ts   # Session authentication
│   └── index.ts
│
├── lib/                  # Utilities
│   ├── constants.ts      # App constants (status options, admin tasks, etc.)
│   ├── date-utils.ts     # Date manipulation helpers
│   └── utils.ts          # cn() helper for Tailwind classes
│
├── types/                # TypeScript types
│   └── index.ts          # Re-exports service types + app-specific types
│
└── layouts/              # Layout components
    └── root-layout.tsx
```

## Conventions

### Exports
- Use barrel exports (`index.ts`) in each directory
- Components, hooks, and services are exported from their respective index files

### Naming
- Components: PascalCase (`TaskPicker.tsx` exports `TaskPicker`)
- Hooks: camelCase with `use` prefix (`use-worklog.ts` exports `useWorklog`)
- Services: camelCase with `Service` suffix, singleton pattern (`jiraService`)
- Types: PascalCase, grouped by domain in type files

### Component Pattern
- Functional components with TypeScript interfaces for props
- Props interface named `{ComponentName}Props`
- Use `@/` path alias for imports

### Service Pattern
- Extend `ApiClient` base class for HTTP services
- Export singleton instance + class for testing
- Types defined in separate `*.types.ts` files
