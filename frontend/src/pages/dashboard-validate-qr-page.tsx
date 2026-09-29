import DashboardLayout from "@/components/dashboard-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TicketValidationMethod,
  TicketValidationStatus,
} from "@/domain/domain";
import { validateTicket } from "@/lib/api";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Scanner } from "@yudiel/react-qr-scanner";
import { AlertCircle, Check, Keyboard, ScanLine, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "react-oidc-context";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ValidationResult {
  status: TicketValidationStatus;
  ticketId: string;
}

const DashboardValidateQrPage: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [manualId, setManualId] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<ValidationResult | undefined>();

  const handleReset = () => {
    setManualId("");
    setError(undefined);
    setResult(undefined);
  };

  const handleValidate = async (id: string, method: TicketValidationMethod) => {
    if (!user?.access_token || isValidating) {
      return;
    }
    if (!UUID_PATTERN.test(id)) {
      setError(
        method === TicketValidationMethod.QR_SCAN
          ? "That QR code isn't an Eventell ticket."
          : "Ticket ids look like 8-4-4-4-12 characters, e.g. 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed.",
      );
      return;
    }
    setIsValidating(true);
    setError(undefined);
    try {
      const response = await validateTicket(user.access_token, { id, method });
      setResult(response);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleValidate(manualId.trim(), TicketValidationMethod.MANUAL);
  };

  const isValid = result?.status === TicketValidationStatus.VALID;

  return (
    <DashboardLayout
      width="narrow"
      title="Validate tickets"
      description="Scan a ticket's QR code or enter its id. Each ticket is valid once."
    >
      <div className="flex flex-col gap-4">
        {/* Mode switch */}
        <div
          role="tablist"
          aria-label="Validation method"
          className="grid grid-cols-2 gap-1 rounded-full border border-stone-200 bg-white p-1"
        >
          {(
            [
              ["scan", "Scan QR", ScanLine],
              ["manual", "Enter id", Keyboard],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              onClick={() => {
                setMode(value);
                handleReset();
              }}
              className={cn(
                "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                mode === value
                  ? "bg-ink text-white"
                  : "text-muted-foreground hover:text-ink",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {result ? (
          <Card
            role="status"
            aria-live="assertive"
            className={cn(
              "items-center gap-3 border-transparent p-8 text-center",
              isValid
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger",
            )}
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-white">
              {isValid ? (
                <Check aria-hidden className="size-10" />
              ) : (
                <X aria-hidden className="size-10" />
              )}
            </span>
            <p className="text-3xl font-medium tracking-tight">
              {isValid ? "Valid ticket" : "Not valid"}
            </p>
            <p className="text-sm">
              {isValid
                ? "Let them in."
                : "This ticket has already been used or can't be accepted."}
            </p>
            <p className="font-mono text-xs break-all opacity-80">
              {result.ticketId}
            </p>
            <Button
              variant="dark"
              size="lg"
              className="mt-4 h-12 w-full cursor-pointer"
              onClick={handleReset}
              autoFocus
            >
              {mode === "scan" ? "Scan next ticket" : "Check another ticket"}
            </Button>
          </Card>
        ) : mode === "scan" ? (
          <Card className="gap-0 overflow-hidden p-3">
            <div className="overflow-hidden rounded-3xl bg-stone-100">
              <Scanner
                paused={isValidating || error !== undefined}
                onScan={(codes) => {
                  const value = codes[0]?.rawValue;
                  if (value) {
                    handleValidate(
                      value.trim(),
                      TicketValidationMethod.QR_SCAN,
                    );
                  }
                }}
                onError={(err) => setError(errorMessage(err))}
              />
            </div>
            <p className="px-3 pt-3 pb-1 text-center text-sm text-muted-foreground">
              {isValidating
                ? "Checking…"
                : "Point the camera at a ticket QR code."}
            </p>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ticket-id">Ticket id</Label>
                <Input
                  id="ticket-id"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12 font-mono"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                variant="dark"
                size="lg"
                className="h-12 cursor-pointer"
                disabled={isValidating || manualId.trim().length === 0}
              >
                {isValidating ? "Checking…" : "Validate"}
              </Button>
            </form>
          </Card>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Couldn't validate</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 cursor-pointer"
                onClick={() => setError(undefined)}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardValidateQrPage;
