import {
  CreateEventRequest,
  EventDetails,
  EventSummary,
  getErrorMessage,
  PublishedEventDetails,
  PublishedEventSummary,
  SpringBootPagination,
  TicketDetails,
  TicketSummary,
  TicketValidationRequest,
  TicketValidationResponse,
  UpdateEventRequest,
} from "@/domain/domain";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const statusMessages: Record<number, string> = {
  401: "Your session has expired. Please log in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  accessToken?: string;
  body?: unknown;
}

const send = async (
  path: string,
  { method = "GET", accessToken, body }: RequestOptions,
): Promise<Response> => {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    // Error bodies are optional: Spring Security's 401/403 and some 404s are empty
    const text = await response.text();
    let message: string | undefined;
    try {
      message = text ? getErrorMessage(JSON.parse(text)) : undefined;
    } catch {
      message = undefined;
    }
    if (!message) {
      console.error(`${method} ${path} failed with ${response.status}`, text);
    }
    throw new ApiError(
      response.status,
      message ?? statusMessages[response.status] ?? "An unknown error occurred",
    );
  }

  return response;
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const response = await send(path, options);
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

const query = (params: Record<string, string | number | undefined>) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();

export const createEvent = async (
  accessToken: string,
  body: CreateEventRequest,
): Promise<EventDetails> =>
  request("/api/v1/events", { method: "POST", accessToken, body });

export const updateEvent = async (
  accessToken: string,
  id: string,
  body: UpdateEventRequest,
): Promise<EventDetails> =>
  request(`/api/v1/events/${id}`, { method: "PUT", accessToken, body });

export const listEvents = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<EventSummary>> =>
  request(`/api/v1/events?${query({ page, size: 10 })}`, { accessToken });

export const getEvent = async (
  accessToken: string,
  id: string,
): Promise<EventDetails> => request(`/api/v1/events/${id}`, { accessToken });

export const deleteEvent = async (
  accessToken: string,
  id: string,
): Promise<void> =>
  request(`/api/v1/events/${id}`, { method: "DELETE", accessToken });

export const listPublishedEvents = async (
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> =>
  request(`/api/v1/published-events?${query({ page, size: 8 })}`);

export const searchPublishedEvents = async (
  q: string,
  page: number,
): Promise<SpringBootPagination<PublishedEventSummary>> =>
  request(`/api/v1/published-events?${query({ q: q.trim(), page, size: 8 })}`);

export const getPublishedEvent = async (
  id: string,
): Promise<PublishedEventDetails> => request(`/api/v1/published-events/${id}`);

export const purchaseTicket = async (
  accessToken: string,
  eventId: string,
  ticketTypeId: string,
): Promise<void> =>
  request(`/api/v1/events/${eventId}/ticket-types/${ticketTypeId}/tickets`, {
    method: "POST",
    accessToken,
  });

export const listTickets = async (
  accessToken: string,
  page: number,
): Promise<SpringBootPagination<TicketSummary>> =>
  request(`/api/v1/tickets?${query({ page, size: 9 })}`, { accessToken });

export const getTicket = async (
  accessToken: string,
  id: string,
): Promise<TicketDetails> => request(`/api/v1/tickets/${id}`, { accessToken });

export const getTicketQr = async (
  accessToken: string,
  id: string,
): Promise<Blob> => {
  const response = await send(`/api/v1/tickets/${id}/qr-codes`, {
    accessToken,
  });
  return response.blob();
};

export const validateTicket = async (
  accessToken: string,
  body: TicketValidationRequest,
): Promise<TicketValidationResponse> =>
  request("/api/v1/ticket-validations", {
    method: "POST",
    accessToken,
    body,
  });
