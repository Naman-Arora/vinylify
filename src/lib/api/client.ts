import type { Router } from "$lib/api";
import { hc } from "hono/client";

let browserClient: ReturnType<typeof hc<Router>>;

export const makeAPIClient = (
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
) => {
  const isBrowser = typeof window !== "undefined";
  const origin = isBrowser ? window.location.origin : "";

  if (isBrowser && browserClient) {
    return browserClient;
  }

  const api = hc<Router>(origin + "/api", { fetch });

  if (isBrowser) {
    browserClient = api;
  }

  return api;
};
