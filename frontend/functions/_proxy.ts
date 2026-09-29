// Cloudflare Pages Functions that forward same-origin paths to the Render services,
// so the SPA can keep calling /api, /realms and /resources on its own origin.

type Env = {
  API_ORIGIN: string; // e.g. https://eventell-api.onrender.com
  KEYCLOAK_ORIGIN: string; // e.g. https://eventell-kc.onrender.com
};

type Context = { request: Request; env: Env };

export const proxyTo =
  (pickOrigin: (env: Env) => string) =>
  ({ request, env }: Context) => {
    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname + incoming.search, pickOrigin(env));
    // Keep redirects un-followed so Keycloak's login redirects reach the browser
    return fetch(new Request(target, request), { redirect: "manual" });
  };
