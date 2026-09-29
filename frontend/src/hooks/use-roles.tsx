import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { jwtDecode } from "jwt-decode";

export type Role = "ROLE_ORGANIZER" | "ROLE_ATTENDEE" | "ROLE_STAFF";

interface UseRolesReturn {
  isLoading: boolean;
  roles: string[];
  isOrganizer: boolean;
  isAttendee: boolean;
  isStaff: boolean;
}

interface JwtPayload {
  realm_access?: {
    roles?: string[];
  };
}

const parseRoles = (accessToken: string | undefined): string[] => {
  if (!accessToken) {
    return [];
  }
  try {
    const payload = jwtDecode<JwtPayload>(accessToken);
    return (payload.realm_access?.roles ?? []).filter((role) =>
      role.startsWith("ROLE_"),
    );
  } catch (error) {
    console.error("Error parsing JWT: " + error);
    return [];
  }
};

// Derived synchronously from the token so a silent token renewal never flickers a loading state
export const useRoles = (): UseRolesReturn => {
  const { isLoading, user } = useAuth();
  const accessToken = user?.access_token;

  return useMemo(() => {
    const roles = parseRoles(accessToken);
    return {
      isLoading,
      roles,
      isOrganizer: roles.includes("ROLE_ORGANIZER"),
      isAttendee: roles.includes("ROLE_ATTENDEE"),
      isStaff: roles.includes("ROLE_STAFF"),
    };
  }, [isLoading, accessToken]);
};
