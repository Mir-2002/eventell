import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router";
import PublicCentered from "@/components/public-centered";
import PageState from "@/components/page-state";
import { Button } from "@/components/ui/button";

const LoginPage: React.FC = () => {
  const { isLoading, isAuthenticated, signinRedirect, error } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated || error) {
      return;
    }
    signinRedirect();
  }, [isLoading, isAuthenticated, error, signinRedirect]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PublicCentered showNav={false}>
      <PageState
        variant={error ? "error" : "loading"}
        title={error ? "We couldn't reach sign in" : "Taking you to sign in…"}
        message={error?.message}
        action={
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => signinRedirect()}
          >
            {error ? "Try again" : "Continue to sign in"}
          </Button>
        }
      />
    </PublicCentered>
  );
};

export default LoginPage;
