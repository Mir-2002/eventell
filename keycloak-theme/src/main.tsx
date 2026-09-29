import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { KcPage } from "./kc.gen";
import "./main.css";

const render = async () => {
  // Local preview without Keycloak: `npm run dev`, then pick a page with ?page=register.ftl
  if (import.meta.env.DEV && !window.kcContext) {
    const { getKcContextMock } = await import("./login/KcPageStory");
    const pageId =
      new URLSearchParams(location.search).get("page") ?? "login.ftl";
    window.kcContext = getKcContextMock({ pageId: pageId as "login.ftl" });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      {window.kcContext ? (
        <KcPage kcContext={window.kcContext} />
      ) : (
        <h1>No Keycloak context</h1>
      )}
    </StrictMode>,
  );
};

render();
