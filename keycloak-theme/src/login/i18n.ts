import { i18nBuilder } from "keycloakify/login";
import type { ThemeName } from "../kc.gen";

// Keycloak's defaults are Title Case; Eventell copy is sentence case
const { useI18n, ofTypeI18n } = i18nBuilder
  .withThemeName<ThemeName>()
  .withCustomTranslations({
    en: {
      loginAccountTitle: "Welcome back",
      loginTitle: "Sign in to Eventell",
      doLogIn: "Sign in",
      doRegister: "Create an account",
      registerTitle: "Create your account",
      noAccount: "New to Eventell?",
      doForgotPassword: "Forgot your password?",
      emailForgotTitle: "Reset your password",
      doTryAnotherWay: "Try another way",
      loginProfileTitle: "Update your details",
      errorTitle: "Something went wrong",
      errorTitleHtml: "Something went wrong",
      backToLogin: "Back to sign in",
      backToApplication: "Back to Eventell",
      proceedWithAction: "Continue",
      doLogout: "Log out",
      logoutConfirmTitle: "Logging out",
      logoutConfirmHeader: "Log out of Eventell?",
    },
  })
  .build();

type I18n = typeof ofTypeI18n;

export { useI18n, type I18n };
