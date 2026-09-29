import BackgroundBlobs from "@/components/background-blobs";
import NavBar from "@/components/nav-bar";
import PageState from "@/components/page-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublishedEventDetails } from "@/domain/domain";
import { getPublishedEvent, purchaseTicket } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDateRange, formatPrice } from "@/lib/format";
import { AlertCircle, Calendar, Check, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router";

const PurchaseTicketPage: React.FC = () => {
  const { eventId, ticketTypeId } = useParams();
  const { user } = useAuth();
  const [publishedEvent, setPublishedEvent] = useState<
    PublishedEventDetails | undefined
  >();
  const [loadError, setLoadError] = useState<string | undefined>();
  const [purchaseError, setPurchaseError] = useState<string | undefined>();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPurchaseSuccess, setIsPurchaseSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) {
      return;
    }
    getPublishedEvent(eventId)
      .then(setPublishedEvent)
      .catch((err) => setLoadError(errorMessage(err)));
  }, [eventId]);

  const ticketType = publishedEvent?.ticketTypes.find(
    (type) => type.id === ticketTypeId,
  );

  const handlePurchase = async () => {
    if (!user?.access_token || !eventId || !ticketTypeId) {
      return;
    }
    setIsPurchasing(true);
    setPurchaseError(undefined);
    try {
      await purchaseTicket(user.access_token, eventId, ticketTypeId);
      setIsPurchaseSuccess(true);
    } catch (err) {
      setPurchaseError(errorMessage(err));
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderBody = () => {
    if (loadError || (publishedEvent && !ticketType)) {
      return (
        <PageState
          variant={loadError ? "error" : "empty"}
          title={loadError ? undefined : "That ticket isn't available"}
          message={loadError ?? "It may have been removed by the organizer."}
          action={
            <Button asChild variant="outline">
              <Link to={eventId ? `/events/${eventId}` : "/"}>
                Back to the event
              </Link>
            </Button>
          }
        />
      );
    }
    if (!publishedEvent || !ticketType) {
      return <PageState />;
    }

    if (isPurchaseSuccess) {
      return (
        <Card className="items-center gap-4 p-8 text-center md:p-10">
          <span className="flex size-14 items-center justify-center rounded-full bg-sage text-success">
            <Check aria-hidden className="size-7" />
          </span>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">
            You're{" "}
            <span className="font-accent text-5xl text-coral md:text-6xl">
              going
            </span>
          </h1>
          <p className="text-muted-foreground">
            Your {ticketType.name} ticket for {publishedEvent.name} is ready.
            Show its QR code at the door.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild variant="dark" size="lg">
              <Link to="/dashboard/tickets">View my tickets</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Browse more events</Link>
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <>
        <h1 className="mb-8 text-center text-5xl font-medium tracking-tight md:text-6xl">
          Almost{" "}
          <span className="font-accent text-6xl text-coral md:text-7xl">
            there
          </span>
        </h1>
        <Card className="gap-0 overflow-hidden py-0">
          <div className="border-b border-stone-100 p-6 md:p-8">
            <p className="text-sm text-muted-foreground">Event</p>
            <h2 className="mt-1 text-2xl font-medium tracking-tight">
              {publishedEvent.name}
            </h2>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {publishedEvent.venue}
              </p>
              <p className="flex items-start gap-2">
                <Calendar aria-hidden className="mt-0.5 size-4 shrink-0" />
                {formatDateRange(publishedEvent.start, publishedEvent.end)}
              </p>
            </div>
          </div>
          <div className="flex items-start justify-between gap-4 p-6 md:p-8">
            <div>
              <p className="text-sm text-muted-foreground">Ticket</p>
              <p className="mt-1 font-medium">{ticketType.name}</p>
              {ticketType.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {ticketType.description}
                </p>
              )}
            </div>
            <p className="shrink-0 text-2xl font-medium tracking-tight">
              {formatPrice(ticketType.price)}
            </p>
          </div>
          <div className="flex flex-col gap-4 bg-stone-50 p-6 md:p-8">
            {purchaseError && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>We couldn't get your ticket</AlertTitle>
                <AlertDescription>{purchaseError}</AlertDescription>
              </Alert>
            )}
            <Button
              variant="dark"
              size="lg"
              className="h-12 w-full cursor-pointer"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? "Confirming…" : "Confirm purchase"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              This is a demo: no payment is taken.
            </p>
          </div>
        </Card>
      </>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      <main className="relative isolate px-4 pt-16 md:pt-24">
        <BackgroundBlobs />
        <div className="mx-auto max-w-xl motion-safe:animate-reveal">
          {renderBody()}
        </div>
      </main>
    </div>
  );
};

export default PurchaseTicketPage;
