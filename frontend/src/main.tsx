import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AttendeeLandingPage from "./pages/attendee-landing-page.tsx";
import { AuthProvider } from "react-oidc-context";
import { createBrowserRouter, RouterProvider } from "react-router";
import OrganizersLandingPage from "./pages/organizers-landing-page.tsx";
import DashboardManageEventPage from "./pages/dashboard-manage-event-page.tsx";
import LoginPage from "./pages/login-page.tsx";
import ProtectedRoute from "./components/protected-route.tsx";
import CallbackPage from "./pages/callback-page.tsx";
import DashboardListEventsPage from "./pages/dashboard-list-events-page.tsx";
import PublishedEventsPage from "./pages/published-events-page.tsx";
import PurchaseTicketPage from "./pages/purchase-ticket-page.tsx";
import DashboardListTickets from "./pages/dashboard-list-tickets.tsx";
import DashboardPage from "./pages/dashboard-page.tsx";
import DashboardViewTicketPage from "./pages/dashboard-view-ticket-page.tsx";
import DashboardValidateQrPage from "./pages/dashboard-validate-qr-page.tsx";
import GrainOverlay from "./components/grain-overlay.tsx";
import NotFoundPage from "./pages/not-found-page.tsx";

const router = createBrowserRouter([
  {
    // Pathless parent so one error boundary covers every page
    ErrorBoundary: NotFoundPage,
    children: [
      {
        path: "/",
        Component: AttendeeLandingPage,
      },
      {
        path: "/callback",
        Component: CallbackPage,
      },
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/events/:id",
        Component: PublishedEventsPage,
      },
      {
        path: "/events/:eventId/purchase/:ticketTypeId",
        element: (
          <ProtectedRoute roles={["ROLE_ATTENDEE"]}>
            <PurchaseTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/organizers",
        Component: OrganizersLandingPage,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events",
        element: (
          <ProtectedRoute roles={["ROLE_ORGANIZER"]}>
            <DashboardListEventsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/tickets",
        element: (
          <ProtectedRoute roles={["ROLE_ATTENDEE"]}>
            <DashboardListTickets />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/tickets/:id",
        element: (
          <ProtectedRoute roles={["ROLE_ATTENDEE"]}>
            <DashboardViewTicketPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/validate-qr",
        element: (
          <ProtectedRoute roles={["ROLE_STAFF"]}>
            <DashboardValidateQrPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events/create",
        element: (
          <ProtectedRoute roles={["ROLE_ORGANIZER"]}>
            <DashboardManageEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/events/update/:id",
        element: (
          <ProtectedRoute roles={["ROLE_ORGANIZER"]}>
            <DashboardManageEventPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);

const oidcConfig = {
  authority: `${window.location.origin}/realms/eventell-app`,
  client_id: "eventell-app",
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig}>
      <RouterProvider router={router} />
      <GrainOverlay />
    </AuthProvider>
  </StrictMode>,
);
