import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import RootLayout from '@/layouts/root-layout'
import { HomePage } from '@/pages/home'
import { WorklogPage } from '@/pages/worklog'
import { HistoryPage } from '@/pages/history'
import { SSEMonitorPage } from '@/pages/sse-monitor'

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Home route (App selector)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Worklog creator route
const worklogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/worklog',
  component: WorklogPage,
})

// History route
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
})

// SSE Monitor route
const sseMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sse-monitor',
  component: SSEMonitorPage,
})

// Route tree
const routeTree = rootRoute.addChildren([indexRoute, worklogRoute, historyRoute, sseMonitorRoute])

// Create router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
