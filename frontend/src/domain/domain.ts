// The backend serialises its ErrorDto as {"Error": "..."}; accept either casing
export const getErrorMessage = (obj: unknown): string | undefined => {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }
  const record = obj as Record<string, unknown>;
  const message = record.error ?? record.Error;
  return typeof message === "string" ? message : undefined;
};

// Backend dates are LocalDateTime: ISO strings without a timezone, e.g. "2026-10-01T18:00:00"
export type LocalDateTime = string;

export enum EventStatusEnum {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface CreateTicketTypeRequest {
  name: string;
  price: number;
  description: string;
  totalAvailable?: number | null;
}

export interface CreateEventRequest {
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
  salesStart?: LocalDateTime;
  salesEnd?: LocalDateTime;
  status: EventStatusEnum;
  ticketTypes: CreateTicketTypeRequest[];
}

export interface UpdateTicketTypeRequest {
  id: string | null;
  name: string;
  price: number;
  description: string;
  totalAvailable?: number | null;
}

export interface UpdateEventRequest {
  id: string;
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
  salesStart?: LocalDateTime;
  salesEnd?: LocalDateTime;
  status: EventStatusEnum;
  ticketTypes: UpdateTicketTypeRequest[];
}

export interface TicketTypeSummary {
  id: string;
  name: string;
  price: number;
  description: string;
  totalAvailable?: number | null;
}

export interface EventSummary {
  id: string;
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
  salesStart?: LocalDateTime;
  salesEnd?: LocalDateTime;
  status: EventStatusEnum;
  ticketTypes: TicketTypeSummary[];
}

export interface PublishedEventSummary {
  id: string;
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
}

export interface TicketTypeDetails {
  id: string;
  name: string;
  price: number;
  description: string;
  totalAvailable?: number | null;
}

export interface EventDetails {
  id: string;
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
  salesStart?: LocalDateTime;
  salesEnd?: LocalDateTime;
  status: EventStatusEnum;
  ticketTypes: TicketTypeDetails[];
  createdAt: LocalDateTime;
  updatedAt: LocalDateTime;
}

export interface SpringBootPagination<T> {
  content: T[]; // The actual data items for the current page
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean; // Whether this is the last page
  totalElements: number; // Total number of items across all pages
  totalPages: number; // Total number of pages
  size: number; // Page size (items per page)
  number: number; // Current page number (zero-based)
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean; // Whether this is the first page
  numberOfElements: number; // Number of items in the current page
  empty: boolean; // Whether the current page has no items
}

export interface PublishedEventTicketTypeDetails {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PublishedEventDetails {
  id: string;
  name: string;
  start?: LocalDateTime;
  end?: LocalDateTime;
  venue: string;
  ticketTypes: PublishedEventTicketTypeDetails[];
}

export enum TicketStatus {
  PURCHASED = "PURCHASED",
  CANCELLED = "CANCELLED",
}

export interface TicketSummaryTicketType {
  id: string;
  name: string;
  price: number;
}

export interface TicketSummary {
  id: string;
  status: TicketStatus;
  ticketType: TicketSummaryTicketType;
}

export interface TicketDetails {
  id: string;
  status: TicketStatus;
  price: number;
  description: string;
  eventName: string;
  eventVenue: string;
  eventStart?: LocalDateTime | null;
  eventEnd?: LocalDateTime | null;
}

export enum TicketValidationMethod {
  QR_SCAN = "QR_SCAN",
  MANUAL = "MANUAL",
}

export enum TicketValidationStatus {
  VALID = "VALID",
  INVALID = "INVALID",
  EXPIRED = "EXPIRED",
}

export interface TicketValidationRequest {
  id: string;
  method: TicketValidationMethod;
}

export interface TicketValidationResponse {
  ticketId: string;
  status: TicketValidationStatus;
}
