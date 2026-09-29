import { useState } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { useIsPasswordRevealed } from "keycloakify/tools/useIsPasswordRevealed";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx, type KcClsx } from "keycloakify/login/lib/kcClsx";
import { useScript } from "keycloakify/login/pages/Login.useScript";
import { Eye, EyeOff } from "lucide-react";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

// Username + password sign-in (login.ftl), with optional passkeys and social providers
export default function Login(
  props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>,
) {
  const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;
  const { kcClsx } = getKcClsx({ doUseDefaultCss, classes });

  const {
    social,
    realm,
    url,
    usernameHidden,
    login,
    auth,
    registrationDisabled,
    messagesPerField,
    enableWebAuthnConditionalUI,
    authenticators,
  } = kcContext;

  const { msg, msgStr } = i18n;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const webAuthnButtonId = "authenticateWebAuthnButton";
  useScript({ webAuthnButtonId, kcContext, i18n });

  const hasCredentialError = messagesPerField.existsError(
    "username",
    "password",
  );
  const credentialError = hasCredentialError && (
    <span
      id="input-error"
      className={kcClsx("kcInputErrorMessageClass")}
      aria-live="polite"
      dangerouslySetInnerHTML={{
        __html: kcSanitize(
          messagesPerField.getFirstError("username", "password"),
        ),
      }}
    />
  );

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={doUseDefaultCss}
      classes={classes}
      displayMessage={!hasCredentialError}
      headerNode={
        <>
          Welcome <span className="font-accent text-6xl text-coral">back</span>
        </>
      }
      documentTitle={msgStr("loginTitle")}
      displayInfo={
        realm.password && realm.registrationAllowed && !registrationDisabled
      }
      infoNode={
        <span>
          {msg("noAccount")}{" "}
          <a href={url.registrationUrl}>{msg("doRegister")}</a>
        </span>
      }
      socialProvidersNode={
        realm.password &&
        social?.providers !== undefined &&
        social.providers.length !== 0 && (
          <div className={kcClsx("kcFormSocialAccountSectionClass")}>
            <p className="flex items-center gap-3 before:h-px before:flex-1 before:bg-stone-100 after:h-px after:flex-1 after:bg-stone-100">
              {msg("identity-provider-login-label")}
            </p>
            <ul className={kcClsx("kcFormSocialAccountListClass")}>
              {social.providers.map((provider) => (
                <li key={provider.alias}>
                  <a
                    id={`social-${provider.alias}`}
                    className={`${kcClsx("kcFormSocialAccountListButtonClass")} no-underline!`}
                    href={provider.loginUrl}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: kcSanitize(provider.displayName),
                      }}
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )
      }
    >
      {realm.password && (
        <form
          id="kc-form-login"
          onSubmit={() => {
            setIsSubmitting(true);
            return true;
          }}
          action={url.loginAction}
          method="post"
          className="flex flex-col"
        >
          {!usernameHidden && (
            <div className={kcClsx("kcFormGroupClass")}>
              <label htmlFor="username" className={kcClsx("kcLabelClass")}>
                {!realm.loginWithEmailAllowed
                  ? msg("username")
                  : !realm.registrationEmailAsUsername
                    ? msg("usernameOrEmail")
                    : msg("email")}
              </label>
              <input
                id="username"
                className={kcClsx("kcInputClass")}
                name="username"
                defaultValue={login.username ?? ""}
                type="text"
                autoFocus
                autoComplete={
                  enableWebAuthnConditionalUI ? "username webauthn" : "username"
                }
                aria-invalid={hasCredentialError}
                aria-describedby={
                  hasCredentialError ? "input-error" : undefined
                }
              />
              {credentialError}
            </div>
          )}

          <div className={kcClsx("kcFormGroupClass")}>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="password" className={kcClsx("kcLabelClass")}>
                {msg("password")}
              </label>
              {realm.resetPasswordAllowed && (
                <a href={url.loginResetCredentialsUrl} className="text-sm">
                  {msg("doForgotPassword")}
                </a>
              )}
            </div>
            <PasswordField
              kcClsx={kcClsx}
              i18n={i18n}
              hasError={hasCredentialError}
            />
            {usernameHidden && credentialError}
          </div>

          {realm.rememberMe && !usernameHidden && (
            <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                defaultChecked={!!login.rememberMe}
                className={kcClsx("kcCheckboxInputClass")}
              />
              {msg("rememberMe")}
            </label>
          )}

          <input
            type="hidden"
            id="id-hidden-input"
            name="credentialId"
            value={auth.selectedCredential}
          />
          <button
            disabled={isSubmitting}
            className={kcClsx(
              "kcButtonClass",
              "kcButtonPrimaryClass",
              "kcButtonBlockClass",
            )}
            name="login"
            id="kc-login"
            type="submit"
          >
            {isSubmitting ? "Signing in…" : msgStr("doLogIn")}
          </button>
        </form>
      )}

      {enableWebAuthnConditionalUI && (
        <>
          <form id="webauth" action={url.loginAction} method="post">
            <input type="hidden" id="clientDataJSON" name="clientDataJSON" />
            <input
              type="hidden"
              id="authenticatorData"
              name="authenticatorData"
            />
            <input type="hidden" id="signature" name="signature" />
            <input type="hidden" id="credentialId" name="credentialId" />
            <input type="hidden" id="userHandle" name="userHandle" />
            <input type="hidden" id="error" name="error" />
          </form>
          {authenticators !== undefined &&
            authenticators.authenticators.length !== 0 && (
              <form id="authn_select">
                {authenticators.authenticators.map((authenticator, i) => (
                  <input
                    key={i}
                    type="hidden"
                    name="authn_use_chk"
                    readOnly
                    value={authenticator.credentialId}
                  />
                ))}
              </form>
            )}
          <input
            id={webAuthnButtonId}
            type="button"
            className={`mt-3 ${kcClsx("kcButtonClass", "kcButtonDefaultClass", "kcButtonBlockClass")}`}
            value={msgStr("passkey-doAuthenticate")}
          />
        </>
      )}
    </Template>
  );
}

// Its own component so the reveal hook runs once the input is in the DOM;
// Template only renders children after Keycloak's resources have loaded
function PasswordField(props: {
  kcClsx: KcClsx;
  i18n: I18n;
  hasError: boolean;
}) {
  const { kcClsx, i18n, hasError } = props;
  const { isPasswordRevealed, toggleIsPasswordRevealed } =
    useIsPasswordRevealed({ passwordInputId: "password" });

  return (
    <div className={kcClsx("kcInputGroup")}>
      <input
        id="password"
        className={kcClsx("kcInputClass")}
        name="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={hasError}
        aria-describedby={hasError ? "input-error" : undefined}
      />
      <button
        type="button"
        className={kcClsx("kcFormPasswordVisibilityButtonClass")}
        aria-label={i18n.msgStr(
          isPasswordRevealed ? "hidePassword" : "showPassword",
        )}
        aria-controls="password"
        onClick={toggleIsPasswordRevealed}
      >
        {isPasswordRevealed ? (
          <EyeOff aria-hidden className="size-4" />
        ) : (
          <Eye aria-hidden className="size-4" />
        )}
      </button>
    </div>
  );
}
