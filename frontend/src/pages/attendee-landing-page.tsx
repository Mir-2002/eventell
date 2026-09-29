import { Button } from "../components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { PublishedEventSummary, SpringBootPagination } from "@/domain/domain";
import { listPublishedEvents, searchPublishedEvents } from "@/lib/api";
import PublishedEventCard from "@/components/published-event-card";
import { SimplePagination } from "@/components/simple-pagination";
import BackgroundBlobs from "@/components/background-blobs";
import NavBar from "@/components/nav-bar";
import PageState from "@/components/page-state";
import { errorMessage } from "@/lib/errors";

const AttendeeLandingPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [publishedEvents, setPublishedEvents] = useState<
    SpringBootPagination<PublishedEventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  // What's typed vs. the search that was submitted
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = submittedQuery
          ? await searchPublishedEvents(submittedQuery, page)
          : await listPublishedEvents(page);
        if (!cancelled) {
          setPublishedEvents(result);
          setError(undefined);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, submittedQuery]);

  const submitSearch = () => {
    setSubmittedQuery(query.trim());
    setPage(0);
  };

  return (
    <div className="min-h-screen pb-16">
      <NavBar />

      {/* Hero */}
      <section className="relative isolate px-4 pt-20 pb-16 text-center md:pt-28 md:pb-24">
        <BackgroundBlobs />
        <div className="mx-auto max-w-3xl motion-safe:animate-reveal">
          <h1 className="text-5xl font-medium tracking-tight text-ink md:text-7xl">
            Find tickets to your next{" "}
            <span className="font-accent text-6xl text-coral md:text-8xl">
              adventure
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[500px] text-lg text-muted-foreground">
            Concerts, talks and meetups worth leaving the house for. Browse
            what's on and get your ticket in a few taps.
          </p>
          <form
            className="mx-auto mt-10 flex max-w-lg gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <Input
              aria-label="Search events"
              placeholder="Search events"
              className="h-12 bg-white shadow-soft"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Search"
              className="size-12 cursor-pointer"
            >
              <Search />
            </Button>
          </form>
        </div>
      </section>

      {/* Published Event Cards */}
      <section className="container mx-auto px-4 motion-safe:animate-reveal">
        <h2 className="mb-6 text-2xl font-medium tracking-tight">
          {submittedQuery
            ? `Results for “${submittedQuery}”`
            : "Upcoming events"}
        </h2>
        {error ? (
          <PageState variant="error" message={error} />
        ) : !publishedEvents ? (
          <PageState />
        ) : publishedEvents.content.length === 0 ? (
          <PageState
            variant="empty"
            title={
              submittedQuery ? "No events match that search" : "No events yet"
            }
            message={
              submittedQuery
                ? "Try a different name or venue."
                : "Check back soon, new events are on their way."
            }
            action={
              submittedQuery && (
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setQuery("");
                    setSubmittedQuery("");
                    setPage(0);
                  }}
                >
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-4">
            {publishedEvents.content.map((publishedEvent) => (
              <PublishedEventCard
                publishedEvent={publishedEvent}
                key={publishedEvent.id}
              />
            ))}
          </div>
        )}
      </section>

      {publishedEvents && !error && (
        <div className="flex w-full justify-center py-8">
          <SimplePagination
            pagination={publishedEvents}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AttendeeLandingPage;
