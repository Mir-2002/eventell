import DashboardLayout from "@/components/dashboard-layout";
import PageState from "@/components/page-state";
import { SimplePagination } from "@/components/simple-pagination";
import StatusBadge from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SpringBootPagination, TicketSummary } from "@/domain/domain";
import { listTickets } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import { ChevronRight, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";

const DashboardListTickets: React.FC = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;

  const [tickets, setTickets] = useState<
    SpringBootPagination<TicketSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    listTickets(accessToken, page)
      .then((result) => {
        setTickets(result);
        setError(undefined);
      })
      .catch((err) => setError(errorMessage(err)));
  }, [accessToken, page]);

  const renderBody = () => {
    if (error) {
      return <PageState variant="error" message={error} />;
    }
    if (!tickets) {
      return <PageState />;
    }
    if (tickets.content.length === 0) {
      return (
        <PageState
          variant="empty"
          title="No tickets yet"
          message="When you get a ticket to an event, it'll show up here."
          action={
            <Button asChild>
              <Link to="/">Browse events</Link>
            </Button>
          }
        />
      );
    }

    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.content.map((ticketItem) => (
            <Link
              key={ticketItem.id}
              to={`/dashboard/tickets/${ticketItem.id}`}
              className="group rounded-[2rem] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Card className="h-full gap-4 p-5 transition-colors group-hover:border-stone-200">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-sage">
                    <Ticket aria-hidden className="size-5" />
                  </span>
                  <StatusBadge status={ticketItem.status} />
                </div>
                <div>
                  <h2 className="text-lg font-medium tracking-tight">
                    {ticketItem.ticketType.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(ticketItem.ticketType.price)}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-3 text-sm text-muted-foreground">
                  <span className="font-mono text-xs">
                    #{ticketItem.id.slice(0, 8)}
                  </span>
                  <span className="flex items-center gap-1 transition-colors group-hover:text-ink">
                    Show ticket
                    <ChevronRight aria-hidden className="size-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <div className="flex justify-center pt-8">
          <SimplePagination pagination={tickets} onPageChange={setPage} />
        </div>
      </>
    );
  };

  return (
    <DashboardLayout
      title="Your tickets"
      description="Open a ticket to show its QR code at the door."
    >
      {renderBody()}
    </DashboardLayout>
  );
};

export default DashboardListTickets;
