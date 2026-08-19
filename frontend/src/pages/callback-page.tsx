import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";

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
      navigate(redirectPath ?? "/dashboard");
    } else if (!error) {
      navigate("/login");
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (isLoading) {
    return <p>Processing login...</p>;
  }

  if (error) {
    return (
      <div>
        <p>Login failed: {error.message}</p>
        <button onClick={() => navigate("/login")}>Try again</button>
      </div>
    );
  }

  return <p>Completing login...</p>;
};

export default CallbackPage;
