import { PublishedEventSummary } from "@/domain/domain";
import { Card } from "./ui/card";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "react-router";
import RandomEventImage from "./random-event-image";
import { formatDate } from "@/lib/format";

interface PublishedEventCardProperties {
  publishedEvent: PublishedEventSummary;
}

const PublishedEventCard: React.FC<PublishedEventCardProperties> = ({
  publishedEvent,
}) => {
  const start = formatDate(publishedEvent.start, "EEE d MMM");
  const end = formatDate(publishedEvent.end, "EEE d MMM");

  return (
    <Link
      to={`/events/${publishedEvent.id}`}
      className="group block rounded-3xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className="h-full gap-2 overflow-hidden rounded-3xl py-0 transition-transform motion-safe:group-hover:-translate-y-1">
        <div className="h-[140px]">
          <RandomEventImage />
        </div>
        <div className="flex flex-col gap-2 px-4 pt-2 pb-4">
          <h3 className="text-lg font-medium tracking-tight text-ink transition-colors group-hover:text-coral">
            {publishedEvent.name}
          </h3>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
            {publishedEvent.venue}
          </p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Calendar aria-hidden className="mt-0.5 size-4 shrink-0" />
            {start
              ? end && end !== start
                ? `${start} – ${end}`
                : start
              : "Dates to be announced"}
          </p>
        </div>
      </Card>
    </Link>
  );
};

export default PublishedEventCard;
