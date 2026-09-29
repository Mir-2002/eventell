import { useAuth } from "react-oidc-context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRoles } from "@/hooks/use-roles";
import { Link, NavLink, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn("transition-colors hover:text-ink", isActive && "text-ink");

const NavBar: React.FC = () => {
  const { user, isAuthenticated, signinRedirect, signoutRedirect } = useAuth();
  const { isOrganizer, isAttendee, isStaff } = useRoles();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-4 z-40 mx-auto mt-4 w-[calc(100%-32px)] max-w-5xl rounded-full bg-white/70 py-2 pr-2 pl-4 text-ink shadow-soft backdrop-blur-[20px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6 md:gap-12">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-coral">
              <span className="size-2 rounded-full bg-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Eventell
            </span>
          </Link>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground sm:gap-6">
            {isOrganizer && (
              <NavLink to="/dashboard/events" className={navLinkClass}>
                Events
              </NavLink>
            )}
            {isAttendee && (
              <NavLink to="/dashboard/tickets" className={navLinkClass}>
                Tickets
              </NavLink>
            )}
            {isStaff && (
              <NavLink to="/dashboard/validate-qr" className={navLinkClass}>
                Validate
              </NavLink>
            )}
            {!isAuthenticated && (
              <NavLink to="/organizers" className={navLinkClass}>
                For organizers
              </NavLink>
            )}
          </div>
        </div>

        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer rounded-full"
              aria-label="Account menu"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-ink text-xs text-white">
                  {user?.profile?.preferred_username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-2xl shadow-soft"
              align="end"
            >
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">
                  {user?.profile?.preferred_username}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {user?.profile?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signoutRedirect()}>
                <LogOut />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="dark"
            className="cursor-pointer"
            onClick={() => signinRedirect()}
          >
            Log in
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
