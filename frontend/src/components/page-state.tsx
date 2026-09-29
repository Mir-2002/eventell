import { ReactNode } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageStateProperties {
  variant?: "loading" | "error" | "empty";
  title?: string;
  message?: ReactNode;
  action?: ReactNode;
  className?: string;
}

// Shared loading / error / empty placeholder for pages and sections
const PageState: React.FC<PageStateProperties> = ({
  variant = "loading",
  title,
  message,
  action,
  className,
}) => {
  const heading =
    title ??
    (variant === "loading"
      ? "Loading…"
      : variant === "error"
        ? "Something went wrong"
        : "Nothing here yet");

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center",
        className,
      )}
    >
      {variant === "loading" ? (
        <LoaderCircle
          aria-hidden
          className="size-6 text-muted-foreground motion-safe:animate-spin"
        />
      ) : variant === "error" ? (
        <span className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertCircle aria-hidden className="size-5" />
        </span>
      ) : (
        <span className="flex size-11 items-center justify-center rounded-2xl bg-ink">
          <span className="size-2.5 rounded-full bg-coral" />
        </span>
      )}
      <p
        className={cn(
          "font-medium tracking-tight",
          variant === "loading" ? "text-sm text-muted-foreground" : "text-lg",
        )}
      >
        {heading}
      </p>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};

export default PageState;
