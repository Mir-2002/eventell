import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";
import { Link, Navigate, useLocation } from "react-router";
import { Role, useRoles } from "@/hooks/use-roles";
import PageState from "./page-state";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";

interface ProtectedRouteProperties {
  children: ReactNode;
  // When set, the user needs at least one of these roles
  roles?: Role[];
}

const roleLabels: Record<Role, string> = {
  ROLE_ORGANIZER: "organizers",
  ROLE_ATTENDEE: "attendees",
  ROLE_STAFF: "event staff",
};

const ProtectedRoute: React.FC<ProtectedRouteProperties> = ({
  children,
  roles,
}) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { isLoading: isRolesLoading, roles: userRoles } = useRoles();
  const location = useLocation();

  if (isLoading || (isAuthenticated && isRolesLoading)) {
    return <PageState className="min-h-screen justify-center" />;
  }

  if (!isAuthenticated) {
    localStorage.setItem(
      "redirectPath",
      globalThis.location.pathname + globalThis.location.search,
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.some((role) => userRoles.includes(role))) {
    return (
      <DashboardLayout>
        <PageState
          variant="empty"
          title="This page isn't for your account"
          message={`It's only available to ${roles.map((role) => roleLabels[role]).join(" or ")}.`}
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard">Go to your dashboard</Link>
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return children;
};

export default ProtectedRoute;
