import DashboardLayout from "@/components/dashboard-layout";
import PageState from "@/components/page-state";
import { SimplePagination } from "@/components/simple-pagination";
import StatusBadge from "@/components/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventSummary, SpringBootPagination } from "@/domain/domain";
import { deleteEvent, listEvents } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatDateRange, formatPrice } from "@/lib/format";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "react-router";

const salesWindow = (eventItem: EventSummary) => {
  const start = formatDate(eventItem.salesStart);
  const end = formatDate(eventItem.salesEnd);
  if (!start && !end) {
    return "Sales open while published";
  }
  return `Sales ${start ?? "open now"} – ${end ?? "until the event"}`;
};

const DashboardListEventsPage: React.FC = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;
  const [events, setEvents] = useState<
    SpringBootPagination<EventSummary> | undefined
  >();
  const [error, setError] = useState<string | undefined>();
  const [page, setPage] = useState(0);

  const [eventToDelete, setEventToDelete] = useState<
    EventSummary | undefined
  >();
  const [deleteEventError, setDeleteEventError] = useState<
    string | undefined
  >();
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshEvents = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    try {
      const result = await listEvents(accessToken, page);
      // Deleting the last event on a page leaves it empty; step back one
      if (result.content.length === 0 && page > 0) {
        setPage(page - 1);
        return;
      }
      setEvents(result);
      setError(undefined);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [accessToken, page]);

  useEffect(() => {
    refreshEvents();
  }, [refreshEvents]);

  const closeDeleteDialog = () => {
    setEventToDelete(undefined);
    setDeleteEventError(undefined);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete || !accessToken) {
      return;
    }
    setIsDeleting(true);
    try {
      setDeleteEventError(undefined);
      await deleteEvent(accessToken, eventToDelete.id);
      closeDeleteDialog();
      await refreshEvents();
    } catch (err) {
      setDeleteEventError(errorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const renderBody = () => {
    if (error) {
      return <PageState variant="error" message={error} />;
    }
    if (!events) {
      return <PageState />;
    }
    if (events.content.length === 0) {
      return (
        <PageState
          variant="empty"
          title="No events yet"
          message="Create your first event to start selling tickets."
          action={
            <Button asChild>
              <Link to="/dashboard/events/create">Create event</Link>
            </Button>
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-3">
        {events.content.map((eventItem) => (
          <Card
            key={eventItem.id}
            className="gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium tracking-tight">
                  {eventItem.name}
                </h2>
                <StatusBadge status={eventItem.status} />
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Venue</dt>
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <dd>{eventItem.venue}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Dates</dt>
                  <Calendar aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <dd>{formatDateRange(eventItem.start, eventItem.end)}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Sales period</dt>
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <dd>{salesWindow(eventItem)}</dd>
                </div>
                <div className="flex items-start gap-2">
                  <dt className="sr-only">Ticket types</dt>
                  <Tag aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <dd>
                    {eventItem.ticketTypes
                      .map(
                        (ticketType) =>
                          `${ticketType.name} · ${formatPrice(ticketType.price)}`,
                      )
                      .join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/dashboard/events/update/${eventItem.id}`}>
                  <Pencil />
                  Edit
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer text-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => setEventToDelete(eventItem)}
              >
                <Trash2 />
                <span className="sr-only">Delete {eventItem.name}</span>
              </Button>
            </div>
          </Card>
        ))}
        <div className="flex justify-center pt-5">
          <SimplePagination pagination={events} onPageChange={setPage} />
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Your events"
      description="Everything you've created, drafts included."
      actions={
        <Button asChild>
          <Link to="/dashboard/events/create">
            <Plus />
            Create event
          </Link>
        </Button>
      }
    >
      {renderBody()}

      <AlertDialog
        open={eventToDelete !== undefined}
        onOpenChange={(open) => !open && closeDeleteDialog()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{eventToDelete?.name}” and its ticket types will be removed. This
              can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEventError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Couldn't delete the event</AlertTitle>
              <AlertDescription>{deleteEventError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Keep it
            </AlertDialogCancel>
            {/* A plain button so the dialog stays open if the delete fails */}
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : "Delete event"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default DashboardListEventsPage;
