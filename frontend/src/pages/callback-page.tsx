import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";
import PublicCentered from "@/components/public-centered";
import PageState from "@/components/page-state";
import { Button } from "@/components/ui/button";

const CallbackPage: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      const redirectPath = localStorage.getItem("redirectPath");
      localStorage.removeItem("redirectPath");
      navigate(redirectPath ?? "/dashboard", { replace: true });
    } else if (!error) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  return (
    <PublicCentered showNav={false}>
      {error ? (
        <PageState
          variant="error"
          title="Login failed"
          message={error.message}
          action={
            <Button
              variant="dark"
              className="cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <PageState title="Signing you in…" />
      )}
    </PublicCentered>
  );
};

export default CallbackPage;
