import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AppRole = "patient" | "therapist" | "admin" | "super_admin";

interface AuthReadyState {
  /** True once the session has been resolved (even if no user) */
  isReady: boolean;
  /** The current authenticated user, or null */
  user: User | null;
  /** The user's role from the `users` table (resolved after isReady) */
  role: AppRole | null;
  /** Whether the user is staff (therapist, admin, or super_admin) */
  isStaff: boolean;
  /** Whether the user is admin or super_admin */
  isAdmin: boolean;
  /** Whether the user is super_admin */
  isSuperAdmin: boolean;
}

/**
 * Centralized auth hook that properly waits for Supabase session restoration
 * before marking ready. Prevents race conditions during token refresh that
 * cause spurious redirects to /auth.
 */
export function useAuthReady(): AuthReadyState {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveRole = async (authUser: User) => {
      try {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", authUser.id)
          .single();
        if (!cancelled && data?.role) {
          setRole(data.role as AppRole);
        }
      } catch {
        // If role fetch fails, still mark ready — pages can handle null role
      }
    };

    // 1. Restore session from storage first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        resolveRole(authUser).then(() => {
          if (!cancelled) setIsReady(true);
        });
      } else {
        setIsReady(true);
      }
    });

    // 2. Listen for subsequent auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        // Re-resolve role on sign-in or token refresh
        resolveRole(authUser).then(() => {
          if (!cancelled) setIsReady(true);
        });
      } else {
        setRole(null);
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    isReady,
    user,
    role,
    isStaff:
      role === "therapist" || role === "admin" || role === "super_admin",
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
  };
}
