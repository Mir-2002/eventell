import { format } from "date-fns";
import { LocalDateTime } from "@/domain/domain";

// Format a backend LocalDateTime; JS parses offset-less ISO strings as local time
export const formatDate = (
  value: LocalDateTime | null | undefined,
  pattern = "PP",
): string | undefined => (value ? format(new Date(value), pattern) : undefined);

export const formatDateRange = (
  start: LocalDateTime | null | undefined,
  end: LocalDateTime | null | undefined,
): string => {
  if (!start && !end) {
    return "Dates to be announced";
  }
  if (start && end) {
    const sameDay =
      formatDate(start, "yyyy-MM-dd") === formatDate(end, "yyyy-MM-dd");
    return sameDay
      ? `${formatDate(start, "EEE d MMM yyyy, p")} – ${formatDate(end, "p")}`
      : `${formatDate(start, "d MMM yyyy, p")} – ${formatDate(end, "d MMM yyyy, p")}`;
  }
  return start
    ? `From ${formatDate(start, "d MMM yyyy, p")}`
    : `Until ${formatDate(end, "d MMM yyyy, p")}`;
};

const priceFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (price: number): string =>
  price === 0 ? "Free" : priceFormatter.format(price);

// Serialise a Date as a LocalDateTime without converting to UTC
export const toLocalDateTime = (date: Date): LocalDateTime =>
  format(date, "yyyy-MM-dd'T'HH:mm:ss");

export const sentenceCase = (value: string): string =>
  value.charAt(0).toUpperCase() +
  value.slice(1).toLowerCase().replace(/_/g, " ");
