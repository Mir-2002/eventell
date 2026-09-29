import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProperties {
  children: ReactNode;
  className?: string;
}

// Fades content up once it scrolls into view. Public pages only; no-op with reduced motion.
const Reveal: React.FC<RevealProperties> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        isVisible ? "motion-safe:animate-reveal" : "motion-safe:opacity-0",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Reveal;
