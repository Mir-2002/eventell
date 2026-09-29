import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProperties {
  items: FaqItem[];
}

const FaqAccordion: React.FC<FaqAccordionProperties> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | undefined>();
  const baseId = useId();

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;
        return (
          <div
            key={item.question}
            className="rounded-2xl border border-stone-100 bg-white"
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? undefined : index)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl p-6 text-left font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {item.question}
                <Plus
                  aria-hidden
                  className={cn(
                    "size-5 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-500",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>
            {/* grid-rows 0fr -> 1fr animates height 0 -> auto */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-500 motion-safe:ease-in-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="px-6 pb-6 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
