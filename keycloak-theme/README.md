# Eventell Keycloak theme

The Eventell sign-in, registration and account-recovery screens, built with [Keycloakify](https://docs.keycloakify.dev). They follow the "Softly" design and pull its tokens straight from `../frontend/src/index.css`, so recolouring the app recolours these pages too.

## Commands

```sh
npm install
npm run dev                   # preview with mock data at http://localhost:5173 (or the next free port)
npm run build-keycloak-theme  # build dist_keycloak/eventell-keycloak-theme.jar (needs Java and Maven)
```

In dev, pick a page with `?page=`, for example `?page=register.ftl`, `?page=login-reset-password.ftl` or `?page=error.ftl`.

## How it's wired up

- `backend/docker-compose.yml` mounts `dist_keycloak/` as Keycloak's `providers` directory.
- `backend/keycloak/eventell-app-realm.json` sets `"loginTheme": "eventell"`.
- After rebuilding the jar, restart Keycloak (`docker compose restart keycloak` in `backend/`) to load it.

## Structure

- `src/login/Template.tsx` is the frame around every page: blobs, grain, logo and the card.
- `src/login/pages/Login.tsx` is the custom sign-in page.
- All other pages are Keycloakify's defaults. They're styled through the class map in `src/login/classes.ts`.
- `src/login/i18n.ts` rewrites Keycloak's Title Case copy in sentence case.
- `src/login/components/` holds copies of the frontend's blobs and grain overlay. Keep them in step with `frontend/src/components`.

To customise another page, add a case for its `pageId` in `src/login/KcPage.tsx`. Base the new page on the matching file in `node_modules/keycloakify/src/login/pages`.
