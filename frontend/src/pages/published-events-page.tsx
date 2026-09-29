import RandomEventImage from "@/components/random-event-image";
import BackgroundBlobs from "@/components/background-blobs";
import NavBar from "@/components/nav-bar";
import PageState from "@/components/page-state";
import { Button } from "@/components/ui/button";
import {
  PublishedEventDetails,
  PublishedEventTicketTypeDetails,
} from "@/domain/domain";
import { ApiError, getPublishedEvent } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDateRange, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Calendar, Check, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const PublishedEventsPage: React.FC = () => {
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const [isNotFound, setIsNotFound] = useState(false);
  const [publishedEvent, setPublishedEvent] = useState<
    PublishedEventDetails | undefined
  >();
  const [selectedTicketType, setSelectedTicketType] = useState<
    PublishedEventTicketTypeDetails | undefined
  >();

  useEffect(() => {
    if (!id) {
      setIsNotFound(true);
      return;
    }

    const load = async () => {
      try {
        const eventData = await getPublishedEvent(id);
        setPublishedEvent(eventData);
        setSelectedTicketType(eventData.ticketTypes[0]);
      } catch (err) {
        // Unknown ids come back as 404, malformed ones as 400 or 500
        if (err instanceof ApiError && err.status < 500) {
          setIsNotFound(true);
        } else {
          setError(errorMessage(err));
        }
      }
    };
    load();
  }, [id]);

  const renderBody = () => {
    if (isNotFound) {
      return (
        <PageState
          variant="empty"
          title="We couldn't find that event"
          message="It may have ended or been unpublished."
          action={
            <Button asChild variant="outline">
              <Link to="/">Browse events</Link>
            </Button>
          }
        />
      );
    }
    if (error) {
      return <PageState variant="error" message={error} />;
    }
    if (!publishedEvent) {
      return <PageState />;
    }

    return (
      <>
        {/* Hero */}
        <section className="relative isolate px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <BackgroundBlobs />
          <div className="mx-auto grid max-w-5xl items-center gap-10 motion-safe:animate-reveal md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-lg font-medium text-muted-foreground">
                You're{" "}
                <span className="font-accent text-4xl text-ink">invited</span>
              </p>
              <h1 className="mt-2 text-5xl font-medium tracking-tight text-ink md:text-7xl">
                {publishedEvent.name}
              </h1>
              <div className="mt-6 flex flex-col gap-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
                  {publishedEvent.venue}
                </p>
                <p className="flex items-start gap-2">
                  <Calendar aria-hidden className="mt-0.5 size-5 shrink-0" />
                  {formatDateRange(publishedEvent.start, publishedEvent.end)}
                </p>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-[2rem] shadow-soft">
              <RandomEventImage />
            </div>
          </div>
        </section>

        {/* Tickets */}
        <section className="mx-auto max-w-5xl px-4 motion-safe:animate-reveal">
          <h2 className="mb-6 text-2xl font-medium tracking-tight">
            Choose your ticket
          </h2>
          {publishedEvent.ticketTypes.length === 0 ? (
            <PageState
              variant="empty"
              title="Tickets aren't on sale yet"
              message="Check back closer to the event."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div
                role="radiogroup"
                aria-label="Ticket types"
                className="flex flex-col gap-3"
              >
                {publishedEvent.ticketTypes.map((ticketType) => {
                  const isSelected = selectedTicketType?.id === ticketType.id;
                  return (
                    <button
                      key={ticketType.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedTicketType(ticketType)}
                      className={cn(
                        "flex cursor-pointer items-start justify-between gap-4 rounded-3xl border bg-white p-5 text-left shadow-soft transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                        isSelected
                          ? "border-coral"
                          : "border-stone-100 hover:border-stone-200",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                            isSelected
                              ? "border-coral bg-coral text-ink"
                              : "border-stone-200",
                          )}
                        >
                          {isSelected && <Check className="size-3" />}
                        </span>
                        <div>
                          <h3 className="font-medium">{ticketType.name}</h3>
                          {ticketType.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {ticketType.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-lg font-medium">
                        {formatPrice(ticketType.price)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedTicketType && (
                <aside className="h-fit rounded-[2rem] bg-sage p-6 md:sticky md:top-24 md:p-8">
                  <p className="text-sm text-muted-foreground">Your pick</p>
                  <h3 className="mt-1 text-2xl font-medium tracking-tight">
                    {selectedTicketType.name}
                  </h3>
                  <p className="mt-4 text-4xl font-medium tracking-tight">
                    {formatPrice(selectedTicketType.price)}
                  </p>
                  <Button asChild size="lg" className="mt-8 w-full">
                    <Link
                      to={`/events/${publishedEvent.id}/purchase/${selectedTicketType.id}`}
                    >
                      Get tickets
                    </Link>
                  </Button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    You'll be asked to log in first.
                  </p>
                </aside>
              )}
            </div>
          )}
        </section>
      </>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      {renderBody()}
    </div>
  );
};

export default PublishedEventsPage;
