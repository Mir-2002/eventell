import { useRoles } from "@/hooks/use-roles";
import { Link, Navigate } from "react-router";
import DashboardLayout from "@/components/dashboard-layout";
import PageState from "@/components/page-state";
import { Button } from "@/components/ui/button";

const DashboardPage: React.FC = () => {
  const { isLoading, isOrganizer, isStaff, isAttendee } = useRoles();

  if (isLoading) {
    return <PageState className="min-h-screen justify-center" />;
  }

  if (isOrganizer) {
    return <Navigate to="/dashboard/events" replace />;
  }
  if (isStaff) {
    return <Navigate to="/dashboard/validate-qr" replace />;
  }
  if (isAttendee) {
    return <Navigate to="/dashboard/tickets" replace />;
  }

  return (
    <DashboardLayout>
      <PageState
        variant="empty"
        title="Your account doesn't have a role yet"
        message="Ask an administrator to give you the organizer, attendee or staff role, then log in again."
        action={
          <Button asChild variant="outline">
            <Link to="/">Browse events</Link>
          </Button>
        }
      />
    </DashboardLayout>
  );
};

export default DashboardPage;
