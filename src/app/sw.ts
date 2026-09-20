/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import { NetworkOnly, Serwist, type RuntimeCaching } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// These are the app's real, authenticated routes — always go to the network
// for them. A stale cached copy could show one user's data to whoever opens
// the app next on a shared device, or silently serve outdated workout state.
// Static assets, the public marketing/auth pages, and offline fallback
// caching are still handled by Serwist's defaultCache below.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/routines",
  "/history",
  "/prs",
  "/progress",
  "/exercises",
  "/body-metrics",
  "/workout",
  "/api",
];

const protectedRoutesRule: RuntimeCaching = {
  matcher: ({ url, sameOrigin }) =>
    sameOrigin &&
    PROTECTED_PREFIXES.some(
      (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
    ),
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [protectedRoutesRule, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
