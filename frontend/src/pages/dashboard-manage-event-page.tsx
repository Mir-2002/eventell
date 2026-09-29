import DashboardLayout from "@/components/dashboard-layout";
import PageState from "@/components/page-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateEventRequest,
  EventStatusEnum,
  LocalDateTime,
  UpdateEventRequest,
} from "@/domain/domain";
import { ApiError, createEvent, getEvent, updateEvent } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import { AlertCircle, ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useNavigate, useParams } from "react-router";

interface TicketTypeData {
  // Local key for React and editing; separate from the server id
  key: string;
  id: string | null;
  name: string;
  price: number;
  totalAvailable: number | null;
  description: string;
}

// datetime-local inputs use "yyyy-MM-ddTHH:mm"; empty string means not set
interface EventFormData {
  name: string;
  venue: string;
  start: string;
  end: string;
  salesStart: string;
  salesEnd: string;
  status: EventStatusEnum;
  ticketTypes: TicketTypeData[];
}

interface TicketTypeDraft {
  key?: string;
  id: string | null;
  name: string;
  price: string;
  totalAvailable: string;
  description: string;
}

const emptyForm: EventFormData = {
  name: "",
  venue: "",
  start: "",
  end: "",
  salesStart: "",
  salesEnd: "",
  status: EventStatusEnum.DRAFT,
  ticketTypes: [],
};

const emptyTicketType: TicketTypeDraft = {
  id: null,
  name: "",
  price: "",
  totalAvailable: "",
  description: "",
};

const toInputValue = (value: LocalDateTime | null | undefined) =>
  value ? value.slice(0, 16) : "";

const toLocalDateTime = (value: string): LocalDateTime | undefined =>
  value ? `${value}:00` : undefined;

const statusOptions: { value: EventStatusEnum; label: string; hint: string }[] =
  [
    {
      value: EventStatusEnum.DRAFT,
      label: "Draft",
      hint: "Only you can see it.",
    },
    {
      value: EventStatusEnum.PUBLISHED,
      label: "Published",
      hint: "Listed publicly and open for ticket sales.",
    },
    {
      value: EventStatusEnum.CANCELLED,
      label: "Cancelled",
      hint: "Hidden from the public listing.",
    },
    {
      value: EventStatusEnum.COMPLETED,
      label: "Completed",
      hint: "The event has happened.",
    },
  ];

interface FieldProperties {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

const Field: React.FC<FieldProperties> = ({
  id,
  label,
  hint,
  error,
  children,
}) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error ? (
      <p id={`${id}-error`} className="text-xs text-danger">
        {error}
      </p>
    ) : (
      hint && <p className="text-xs text-muted-foreground">{hint}</p>
    )}
  </div>
);

const Section: React.FC<{
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}> = ({ title, description, action, children }) => (
  <Card className="gap-5 p-6 md:p-8">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-medium tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
    {children}
  </Card>
);

type FormErrors = Partial<
  Record<"name" | "venue" | "end" | "salesEnd" | "ticketTypes", string>
>;

const toCreateTicketTypeRequest = (ticketType: TicketTypeData) => ({
  name: ticketType.name,
  price: ticketType.price,
  totalAvailable: ticketType.totalAvailable,
  description: ticketType.description,
});

const toTicketTypeRequest = (ticketType: TicketTypeData) => ({
  id: ticketType.id,
  ...toCreateTicketTypeRequest(ticketType),
});

const validateForm = (form: EventFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Give your event a name.";
  if (!form.venue.trim()) errors.venue = "Add where the event takes place.";
  if (form.start && form.end && form.end < form.start) {
    errors.end = "The event can't end before it starts.";
  }
  if (form.salesStart && form.salesEnd && form.salesEnd < form.salesStart) {
    errors.salesEnd = "Sales can't close before they open.";
  }
  if (form.ticketTypes.length === 0) {
    errors.ticketTypes = "Add at least one ticket type.";
  }
  return errors;
};

const DashboardManageEventPage: React.FC = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState<EventFormData>(emptyForm);
  const [meta, setMeta] = useState<{ createdAt?: string; updatedAt?: string }>(
    {},
  );
  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | undefined>();
  const [isNotFound, setIsNotFound] = useState(false);

  const [submitError, setSubmitError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ticketDraft, setTicketDraft] = useState<TicketTypeDraft | undefined>();
  const [ticketDraftError, setTicketDraftError] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!isEditMode || !accessToken || !id) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const event = await getEvent(accessToken, id);
        if (cancelled) return;
        setForm({
          name: event.name,
          venue: event.venue,
          start: toInputValue(event.start),
          end: toInputValue(event.end),
          salesStart: toInputValue(event.salesStart),
          salesEnd: toInputValue(event.salesEnd),
          status: event.status,
          ticketTypes: event.ticketTypes.map((ticketType) => ({
            key: ticketType.id,
            id: ticketType.id,
            name: ticketType.name,
            price: ticketType.price,
            totalAvailable: ticketType.totalAvailable ?? null,
            description: ticketType.description ?? "",
          })),
        });
        setMeta({ createdAt: event.createdAt, updatedAt: event.updatedAt });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status < 500) {
          setIsNotFound(true);
        } else {
          setLoadError(errorMessage(err));
        }
      } finally {
        if (!cancelled) setIsLoadingEvent(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, accessToken, id]);

  const updateField = <K extends keyof EventFormData>(
    field: K,
    value: EventFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(undefined);

    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !accessToken) {
      return;
    }

    const base = {
      name: form.name.trim(),
      venue: form.venue.trim(),
      start: toLocalDateTime(form.start),
      end: toLocalDateTime(form.end),
      salesStart: toLocalDateTime(form.salesStart),
      salesEnd: toLocalDateTime(form.salesEnd),
      status: form.status,
    };

    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        const request: UpdateEventRequest = {
          ...base,
          id,
          ticketTypes: form.ticketTypes.map(toTicketTypeRequest),
        };
        await updateEvent(accessToken, id, request);
      } else {
        const request: CreateEventRequest = {
          ...base,
          ticketTypes: form.ticketTypes.map(toCreateTicketTypeRequest),
        };
        await createEvent(accessToken, request);
      }
      navigate("/dashboard/events");
    } catch (err) {
      setSubmitError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTicketDialog = (ticketType?: TicketTypeData) => {
    setTicketDraftError(undefined);
    setTicketDraft(
      ticketType
        ? {
            key: ticketType.key,
            id: ticketType.id,
            name: ticketType.name,
            price: String(ticketType.price),
            totalAvailable:
              ticketType.totalAvailable == null
                ? ""
                : String(ticketType.totalAvailable),
            description: ticketType.description,
          }
        : emptyTicketType,
    );
  };

  const saveTicketType = (e: FormEvent) => {
    e.preventDefault();
    if (!ticketDraft) return;

    const price = Number(ticketDraft.price);
    const totalAvailable =
      ticketDraft.totalAvailable.trim() === ""
        ? null
        : Number(ticketDraft.totalAvailable);

    if (!ticketDraft.name.trim()) {
      setTicketDraftError("Give the ticket type a name.");
      return;
    }
    if (
      ticketDraft.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setTicketDraftError("Price must be zero or more.");
      return;
    }
    if (
      totalAvailable !== null &&
      (!Number.isInteger(totalAvailable) || totalAvailable < 1)
    ) {
      setTicketDraftError(
        "Tickets available must be a whole number, or left empty for no limit.",
      );
      return;
    }

    const saved: TicketTypeData = {
      key: ticketDraft.key ?? crypto.randomUUID(),
      id: ticketDraft.id,
      name: ticketDraft.name.trim(),
      price,
      totalAvailable,
      description: ticketDraft.description.trim(),
    };
    const exists = form.ticketTypes.some((t) => t.key === saved.key);
    updateField(
      "ticketTypes",
      exists
        ? form.ticketTypes.map((t) => (t.key === saved.key ? saved : t))
        : [...form.ticketTypes, saved],
    );
    setTicketDraft(undefined);
  };

  const removeTicketType = (key: string) =>
    updateField(
      "ticketTypes",
      form.ticketTypes.filter((t) => t.key !== key),
    );

  const availableStatuses = isEditMode
    ? statusOptions
    : statusOptions.slice(0, 2);
  const statusHint = statusOptions.find((s) => s.value === form.status)?.hint;

  const renderBody = () => {
    if (isNotFound) {
      return (
        <PageState
          variant="empty"
          title="We couldn't find that event"
          message="It may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard/events">Back to your events</Link>
            </Button>
          }
        />
      );
    }
    if (loadError) {
      return <PageState variant="error" message={loadError} />;
    }
    if (isLoadingEvent) {
      return <PageState />;
    }

    return (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Section title="Details">
          <Field
            id="event-name"
            label="Event name"
            hint="The public name of your event."
            error={fieldErrors.name}
          >
            <Input
              id="event-name"
              placeholder="e.g. Rooftop jazz night"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={
                fieldErrors.name ? "event-name-error" : undefined
              }
            />
          </Field>
          <Field
            id="venue"
            label="Venue"
            hint="Where it's happening. Include enough detail for people to find it."
            error={fieldErrors.venue}
          >
            <Textarea
              id="venue"
              placeholder="e.g. The Loft, 12 Harbour Street"
              value={form.venue}
              onChange={(e) => updateField("venue", e.target.value)}
              aria-invalid={!!fieldErrors.venue}
              aria-describedby={fieldErrors.venue ? "venue-error" : undefined}
            />
          </Field>
        </Section>

        <Section
          title="Schedule"
          description="Optional. Leave blank if the dates aren't set yet."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="start" label="Starts">
              <Input
                id="start"
                type="datetime-local"
                value={form.start}
                onChange={(e) => updateField("start", e.target.value)}
              />
            </Field>
            <Field id="end" label="Ends" error={fieldErrors.end}>
              <Input
                id="end"
                type="datetime-local"
                value={form.end}
                min={form.start || undefined}
                onChange={(e) => updateField("end", e.target.value)}
                aria-invalid={!!fieldErrors.end}
                aria-describedby={fieldErrors.end ? "end-error" : undefined}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Ticket sales"
          description="Optional. When tickets can be bought."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sales-start" label="Sales open">
              <Input
                id="sales-start"
                type="datetime-local"
                value={form.salesStart}
                onChange={(e) => updateField("salesStart", e.target.value)}
              />
            </Field>
            <Field
              id="sales-end"
              label="Sales close"
              error={fieldErrors.salesEnd}
            >
              <Input
                id="sales-end"
                type="datetime-local"
                value={form.salesEnd}
                min={form.salesStart || undefined}
                onChange={(e) => updateField("salesEnd", e.target.value)}
                aria-invalid={!!fieldErrors.salesEnd}
                aria-describedby={
                  fieldErrors.salesEnd ? "sales-end-error" : undefined
                }
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Ticket types"
          description="At least one. Leave the total empty for unlimited tickets."
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => openTicketDialog()}
            >
              <Plus />
              Add
            </Button>
          }
        >
          {form.ticketTypes.length === 0 ? (
            <p
              className={
                fieldErrors.ticketTypes
                  ? "rounded-3xl bg-danger-soft p-4 text-sm text-danger"
                  : "rounded-3xl bg-stone-50 p-4 text-sm text-muted-foreground"
              }
            >
              {fieldErrors.ticketTypes ?? "No ticket types yet."}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-stone-100">
              {form.ticketTypes.map((ticketType) => (
                <li
                  key={ticketType.key}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {ticketType.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {formatPrice(ticketType.price)}
                      </span>
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {ticketType.totalAvailable == null
                        ? "Unlimited"
                        : `${ticketType.totalAvailable} available`}
                      {ticketType.description && ` · ${ticketType.description}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => openTicketDialog(ticketType)}
                    >
                      <Pencil />
                      <span className="sr-only">Edit {ticketType.name}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer text-danger hover:bg-danger-soft hover:text-danger"
                      onClick={() => removeTicketType(ticketType.key)}
                    >
                      <Trash2 />
                      <span className="sr-only">Remove {ticketType.name}</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Status">
          <Field id="status" label="Visibility" hint={statusHint}>
            <Select
              value={form.status}
              onValueChange={(value) =>
                updateField("status", value as EventStatusEnum)
              }
            >
              <SelectTrigger id="status" className="w-full sm:w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Section>

        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>
              {isEditMode ? "Couldn't save changes" : "Couldn't create event"}
            </AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard/events">Cancel</Link>
          </Button>
          <Button
            type="submit"
            variant="dark"
            size="lg"
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving…"
              : isEditMode
                ? "Save changes"
                : "Create event"}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <DashboardLayout
      width="narrow"
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/events">
            <ArrowLeft />
            Your events
          </Link>
        </Button>
      }
      title={isEditMode ? "Edit event" : "Create an event"}
      description={
        isEditMode && meta.updatedAt
          ? `Created ${formatDate(meta.createdAt)} · last updated ${formatDate(meta.updatedAt, "PPp")}`
          : isEditMode
            ? undefined
            : "Save it as a draft until you're ready to sell tickets."
      }
    >
      {renderBody()}

      <Dialog
        open={ticketDraft !== undefined}
        onOpenChange={(open) => !open && setTicketDraft(undefined)}
      >
        <DialogContent>
          <form onSubmit={saveTicketType} noValidate className="grid gap-4">
            <DialogHeader>
              <DialogTitle>
                {ticketDraft?.key ? "Edit ticket type" : "Add a ticket type"}
              </DialogTitle>
              <DialogDescription>
                e.g. General admission, Early bird or VIP.
              </DialogDescription>
            </DialogHeader>

            <Field id="ticket-type-name" label="Name">
              <Input
                id="ticket-type-name"
                value={ticketDraft?.name ?? ""}
                onChange={(e) =>
                  setTicketDraft(
                    (prev) => prev && { ...prev, name: e.target.value },
                  )
                }
                placeholder="General admission"
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="ticket-type-price" label="Price ($)">
                <Input
                  id="ticket-type-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={ticketDraft?.price ?? ""}
                  onChange={(e) =>
                    setTicketDraft(
                      (prev) => prev && { ...prev, price: e.target.value },
                    )
                  }
                />
              </Field>
              <Field id="ticket-type-total" label="Tickets available">
                <Input
                  id="ticket-type-total"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder="Unlimited"
                  value={ticketDraft?.totalAvailable ?? ""}
                  onChange={(e) =>
                    setTicketDraft(
                      (prev) =>
                        prev && { ...prev, totalAvailable: e.target.value },
                    )
                  }
                />
              </Field>
            </div>

            <Field id="ticket-type-description" label="Description">
              <Textarea
                id="ticket-type-description"
                placeholder="What's included (optional)"
                value={ticketDraft?.description ?? ""}
                onChange={(e) =>
                  setTicketDraft(
                    (prev) => prev && { ...prev, description: e.target.value },
                  )
                }
              />
            </Field>

            {ticketDraftError && (
              <p role="alert" className="text-sm text-danger">
                {ticketDraftError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setTicketDraft(undefined)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="dark" className="cursor-pointer">
                {ticketDraft?.key ? "Save ticket type" : "Add ticket type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default DashboardManageEventPage;
