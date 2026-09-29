import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { keycloakify } from "keycloakify/vite-plugin";
import { defineConfig } from "vite";

// https://docs.keycloakify.dev
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    keycloakify({
      themeName: "eventell",
      accountThemeImplementation: "none",
      // Keycloak 26 only needs the "all other versions" jar
      keycloakVersionTargets: {
        "22-to-25": false,
        "all-other-versions": "eventell-keycloak-theme.jar",
      },
    }),
  ],
  server: {
    // The shared design tokens live in ../frontend/src/index.css
    fs: { allow: [".."] },
  },
});
