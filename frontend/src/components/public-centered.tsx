import { ReactNode } from "react";
import BackgroundBlobs from "./background-blobs";
import NavBar from "./nav-bar";

interface PublicCenteredProperties {
  children: ReactNode;
  showNav?: boolean;
}

// Full-height public screen with blobs and centered content (auth, 404)
const PublicCentered: React.FC<PublicCenteredProperties> = ({
  children,
  showNav = true,
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      {showNav && <NavBar />}
      <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
        <BackgroundBlobs />
        <div className="w-full max-w-lg text-center motion-safe:animate-reveal">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicCentered;
