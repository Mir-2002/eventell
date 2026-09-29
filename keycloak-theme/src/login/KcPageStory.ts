import { createGetKcContextMock } from "keycloakify/login/KcContext";
import type {
  KcContextExtension,
  KcContextExtensionPerPage,
} from "./KcContext";
import { kcEnvDefaults, themeNames } from "../kc.gen";

// Mock Keycloak context for previewing pages with `npm run dev`
export const { getKcContextMock } = createGetKcContextMock({
  kcContextExtension: {
    themeName: themeNames[0],
    properties: { ...kcEnvDefaults },
  } satisfies KcContextExtension,
  kcContextExtensionPerPage: {} satisfies KcContextExtensionPerPage,
  overrides: {
    realm: { displayName: "Eventell" },
  },
  overridesPerPage: {
    "login.ftl": {
      realm: {
        registrationAllowed: true,
        resetPasswordAllowed: true,
        rememberMe: true,
      },
    },
  },
});
