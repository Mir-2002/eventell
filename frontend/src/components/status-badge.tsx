import { EventStatusEnum, TicketStatus } from "@/domain/domain";
import { sentenceCase } from "@/lib/format";
import { Badge } from "./ui/badge";

type Status = EventStatusEnum | TicketStatus;

const variants: Record<Status, "sage" | "muted" | "danger" | "lavender"> = {
  DRAFT: "muted",
  PUBLISHED: "sage",
  PURCHASED: "sage",
  CANCELLED: "danger",
  COMPLETED: "lavender",
};

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => (
  <Badge variant={variants[status] ?? "muted"}>{sentenceCase(status)}</Badge>
);

export default StatusBadge;
