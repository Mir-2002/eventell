import DashboardLayout from "@/components/dashboard-layout";
import PageState from "@/components/page-state";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TicketDetails, TicketStatus } from "@/domain/domain";
import { ApiError, getTicket, getTicketQr } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDateRange, formatPrice } from "@/lib/format";
import { ArrowLeft, Calendar, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "react-router";

const DashboardViewTicketPage: React.FC = () => {
  const [ticket, setTicket] = useState<TicketDetails | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isNotFound, setIsNotFound] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | undefined>();
  const [qrError, setQrError] = useState<string | undefined>();

  const { id } = useParams();
  const { user } = useAuth();
  const accessToken = user?.access_token;

  useEffect(() => {
    if (!accessToken || !id) {
      return;
    }
    let cancelled = false;
    let objectUrl: string | undefined;

    const load = async () => {
      try {
        const ticketData = await getTicket(accessToken, id);
        if (cancelled) return;
        setTicket(ticketData);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status < 500) {
          setIsNotFound(true);
        } else {
          setError(errorMessage(err));
        }
        return;
      }

      try {
        const blob = await getTicketQr(accessToken, id);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setQrCodeUrl(objectUrl);
      } catch (err) {
        if (!cancelled) setQrError(errorMessage(err));
      }
    };
    load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [accessToken, id]);

  const renderBody = () => {
    if (isNotFound) {
      return (
        <PageState
          variant="empty"
          title="We couldn't find that ticket"
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard/tickets">Back to your tickets</Link>
            </Button>
          }
        />
      );
    }
    if (error) {
      return <PageState variant="error" message={error} />;
    }
    if (!ticket) {
      return <PageState />;
    }

    const isCancelled = ticket.status === TicketStatus.CANCELLED;

    return (
      <Card className="mx-auto max-w-md gap-0 overflow-hidden py-0">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-medium tracking-tight">
              {ticket.eventName}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              {ticket.eventVenue}
            </p>
            <p className="flex items-start gap-2">
              <Calendar aria-hidden className="mt-0.5 size-4 shrink-0" />
              {formatDateRange(ticket.eventStart, ticket.eventEnd)}
            </p>
          </div>
        </div>

        {/* Perforation */}
        <div aria-hidden className="relative h-6">
          <span className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute top-1/2 left-6 right-6 border-t border-dashed border-stone-200" />
          <span className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        </div>

        <div className="flex flex-col items-center gap-3 p-6 md:p-8">
          <div className="rounded-[2rem] bg-sage p-5">
            <div className="flex size-56 items-center justify-center overflow-hidden rounded-3xl bg-white">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR code for this ticket"
                  className={isCancelled ? "size-full opacity-30" : "size-full"}
                />
              ) : qrError ? (
                <p className="p-4 text-center text-sm text-danger">{qrError}</p>
              ) : (
                <LoaderCircle
                  aria-label="Loading QR code"
                  className="size-6 text-muted-foreground motion-safe:animate-spin"
                />
              )}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {isCancelled
              ? "This ticket was cancelled and can't be used."
              : "Show this QR code at the venue to get in."}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-4 border-t border-stone-100 bg-stone-50 p-6 text-sm md:px-8">
          <div>
            <dt className="text-muted-foreground">Ticket</dt>
            <dd className="mt-1 font-medium">
              {ticket.description || "General admission"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Price</dt>
            <dd className="mt-1 font-medium">{formatPrice(ticket.price)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Ticket id</dt>
            <dd className="mt-1 font-mono text-xs break-all select-all">
              {ticket.id}
            </dd>
          </div>
        </dl>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/dashboard/tickets">
          <ArrowLeft />
          Your tickets
        </Link>
      </Button>
      {renderBody()}
    </DashboardLayout>
  );
};

export default DashboardViewTicketPage;
