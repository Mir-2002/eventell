import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import PublicCentered from "@/components/public-centered";
import { Button } from "@/components/ui/button";

// Used for unknown URLs and as the router's error boundary
const NotFoundPage: React.FC = () => {
  const error = useRouteError();
  const isCrash =
    // useRouteError() is null/undefined when rendered as a normal route
    error != null && !(isRouteErrorResponse(error) && error.status === 404);

  if (isCrash) {
    console.error(error);
  }

  return (
    <PublicCentered>
      <h1 className="text-5xl font-medium tracking-tight text-ink md:text-7xl">
        {isCrash ? "Well, that was " : "This page wandered "}
        <span className="font-accent text-6xl text-coral md:text-8xl">
          {isCrash ? "unexpected" : "off"}
        </span>
      </h1>
      <p className="mx-auto mt-6 max-w-[500px] text-lg text-muted-foreground">
        {isCrash
          ? "Something broke on our side. Try again, or head back to the events."
          : "We couldn't find the page you were looking for. It may have moved, or the link might be mistyped."}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/">Browse events</Link>
        </Button>
        {isCrash && (
          <Button
            variant="outline"
            size="lg"
            className="cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        )}
      </div>
    </PublicCentered>
  );
};

export default NotFoundPage;
