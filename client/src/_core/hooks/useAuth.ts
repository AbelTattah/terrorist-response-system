import { useCallback } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const logout = useCallback(async () => {
    // No-op
  }, []);

  return {
    user: { name: "OPERATOR", email: "operator@tars.system" },
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => { },
    logout,
  };
}
