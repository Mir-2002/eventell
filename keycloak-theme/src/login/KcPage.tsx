import { Suspense, lazy } from "react";
import DefaultPage from "keycloakify/login/DefaultPage";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import Template from "./Template";
import { classes } from "./classes";

const UserProfileFormFields = lazy(
  () => import("keycloakify/login/UserProfileFormFields"),
);
const Login = lazy(() => import("./pages/Login"));

const doMakeUserConfirmPassword = true;

// Custom pages first; everything else is Keycloakify's page with Softly classes
export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props;
  const { i18n } = useI18n({ kcContext });

  return (
    <Suspense>
      {(() => {
        switch (kcContext.pageId) {
          case "login.ftl":
            return (
              <Login
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={Template}
                doUseDefaultCss={false}
              />
            );
          default:
            return (
              <DefaultPage
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={Template}
                doUseDefaultCss={false}
                UserProfileFormFields={UserProfileFormFields}
                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
              />
            );
        }
      })()}
    </Suspense>
  );
}
