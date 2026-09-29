import { useEffect } from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import type { TemplateProps } from "keycloakify/login/TemplateProps";
import { useInitialize } from "keycloakify/login/Template.useInitialize";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Info,
  RotateCcw,
} from "lucide-react";
import type { I18n } from "./i18n";
import type { KcContext } from "./KcContext";
import BackgroundBlobs from "./components/background-blobs";
import GrainOverlay from "./components/grain-overlay";

const messageStyles = {
  success: { className: "bg-success-soft text-success", Icon: CheckCircle2 },
  warning: { className: "bg-coral/25 text-ink", Icon: AlertCircle },
  error: { className: "bg-danger-soft text-danger", Icon: AlertCircle },
  info: { className: "bg-lavender text-ink", Icon: Info },
} as const;

// The Eventell frame around every Keycloak page: blobs, grain, logo and a soft card
export default function Template(props: TemplateProps<KcContext, I18n>) {
  const {
    displayInfo = false,
    displayMessage = true,
    displayRequiredFields = false,
    headerNode,
    socialProvidersNode = null,
    infoNode = null,
    documentTitle,
    kcContext,
    i18n,
    doUseDefaultCss,
    children,
  } = props;

  const { msg, msgStr, currentLanguage, enabledLanguages } = i18n;
  const { auth, url, message, isAppInitiatedAction } = kcContext;
  // Only some pages expose the client's base URL; fall back to the site root
  const client = kcContext.client as { baseUrl?: string } | undefined;
  const appUrl = client?.baseUrl;

  useEffect(() => {
    document.title = documentTitle ?? msgStr("loginTitle");
  }, [documentTitle, msgStr]);

  const { isReadyToRender } = useInitialize({ kcContext, doUseDefaultCss });

  if (!isReadyToRender) {
    return null;
  }

  const showMessage =
    displayMessage &&
    message !== undefined &&
    // App-initiated actions shouldn't warn about needing to complete the action
    (message.type !== "warning" || !isAppInitiatedAction);
  const messageStyle = message ? messageStyles[message.type] : undefined;

  return (
    <>
      {/* Outside the isolated layout so mix-blend-overlay blends with the page */}
      <GrainOverlay />
      <div className="relative isolate flex min-h-screen flex-col overflow-hidden px-4 py-8 text-ink">
        <BackgroundBlobs />

        <header className="mx-auto flex w-full max-w-md items-center justify-between">
          <a
            href={appUrl ?? "/"}
            className="flex items-center gap-2 rounded-full"
            aria-label="Eventell home"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-coral">
              <span className="size-2 rounded-full bg-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Eventell
            </span>
          </a>
          {enabledLanguages.length > 1 && (
            <details className="relative text-sm">
              <summary
                aria-label={msgStr("languages")}
                className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 font-medium [&::-webkit-details-marker]:hidden"
              >
                <Globe aria-hidden className="size-4 text-muted-foreground" />
                {currentLanguage.label}
              </summary>
              <ul className="absolute right-0 z-10 mt-2 max-h-72 w-48 overflow-y-auto rounded-3xl border border-stone-100 bg-white p-1.5 shadow-soft">
                {enabledLanguages.map(({ languageTag, label, href }) => (
                  <li key={languageTag}>
                    <a
                      href={href}
                      aria-current={
                        languageTag === currentLanguage.languageTag
                          ? "true"
                          : undefined
                      }
                      className="block rounded-full px-3 py-1.5 text-muted-foreground hover:bg-lavender hover:text-ink aria-[current]:font-medium aria-[current]:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </header>

        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 motion-safe:animate-reveal">
          {auth !== undefined &&
          auth.showUsername &&
          !auth.showResetCredentials ? (
            <div className="mb-6 flex items-center justify-center gap-2">
              <span className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-sm font-medium">
                {auth.attemptedUsername}
              </span>
              <a
                href={url.loginRestartFlowUrl}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-white hover:text-ink"
                aria-label={msgStr("restartLoginTooltip")}
                title={msgStr("restartLoginTooltip")}
              >
                <RotateCcw className="size-4" />
              </a>
            </div>
          ) : (
            <h1 className="mb-8 text-center text-5xl font-medium tracking-tight">
              {headerNode}
            </h1>
          )}

          <div className="rounded-[2rem] border border-stone-100 bg-white p-6 shadow-soft sm:p-8 [&_a]:font-medium [&_a]:text-ink [&_a]:underline-offset-4 [&_a:hover]:underline">
            {displayRequiredFields && (
              <p className="mb-4 text-xs text-muted-foreground">
                <span className="text-danger">*</span> {msg("requiredFields")}
              </p>
            )}

            {showMessage && messageStyle && (
              <div
                role="alert"
                className={`mb-5 flex items-start gap-3 rounded-3xl px-4 py-3 text-sm ${messageStyle.className}`}
              >
                <messageStyle.Icon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0"
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html: kcSanitize(message.summary),
                  }}
                />
              </div>
            )}

            {children}

            {auth !== undefined && auth.showTryAnotherWayLink && (
              <form
                id="kc-select-try-another-way-form"
                action={url.loginAction}
                method="post"
                className="mt-4 text-center text-sm"
              >
                <input type="hidden" name="tryAnotherWay" value="on" />
                <button
                  type="submit"
                  className="cursor-pointer font-medium underline-offset-4 hover:underline"
                >
                  {msg("doTryAnotherWay")}
                </button>
              </form>
            )}

            {socialProvidersNode}
          </div>

          {displayInfo && (
            <div className="mt-6 text-center text-sm text-muted-foreground [&_a]:font-medium [&_a]:text-ink [&_a]:underline-offset-4 [&_a:hover]:underline">
              {infoNode}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
