import { ReactNode } from "react";
import NavBar from "./nav-bar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProperties {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  // Narrow suits single-column forms and tools
  width?: "default" | "narrow";
  children: ReactNode;
}

// Shared shell for dashboard pages: nav, container and a compact heading
const DashboardLayout: React.FC<DashboardLayoutProperties> = ({
  title,
  description,
  actions,
  width = "default",
  children,
}) => {
  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      <main
        className={cn(
          "mx-auto px-4 pt-10 md:pt-14",
          width === "narrow" ? "max-w-2xl" : "max-w-5xl",
        )}
      >
        {title && (
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          </header>
        )}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
