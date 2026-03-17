import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "patient" | "therapist" | "admin" | "super_admin";

interface AuthContextValue {
  /** True once the initial session has been resolved (even if no user) */
  isAuthReady: boolean;
  /** The current authenticated user, or null */
  user: User | null;
  /** The current session, or null */
  session: Session | null;
  /** Whether there is an authenticated user */
  isAuthenticated: boolean;
  /** The user's role from the `users` table */
  role: AppRole | null;
  /** Whether the role has been resolved (separate from auth readiness) */
  isRoleReady: boolean;
  /** Whether the user is staff (therapist, admin, or super_admin) */
  isStaff: boolean;
  /** Whether the user is admin or super_admin */
  isAdmin: boolean;
  /** Whether the user is super_admin */
  isSuperAdmin: boolean;
  /** Force re-fetch role (e.g., after role change) */
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_DEBUG = false;

function authLog(...args: any[]) {
  if (AUTH_DEBUG) {
    console.log("[Auth]", ...args);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isRoleReady, setIsRoleReady] = useState(false);

  const resolveRole = useCallback(async (authUser: User) => {
    // If we already have a role for this user, skip the DB fetch to prevent
    // isRoleReady flickering during navigation-triggered auth events
    if (role !== null) {
      authLog("Role already resolved:", role, "— skipping re-fetch");
      setIsRoleReady(true);
      return;
    }
    try {
      authLog("Resolving role for", authUser.id);
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (error) {
        authLog("Role fetch error:", error.message);
      } else if (data?.role) {
        authLog("Role resolved:", data.role);
        setRole(data.role as AppRole);
      }
    } catch (err) {
      authLog("Role resolution exception:", err);
    } finally {
      setIsRoleReady(true);
    }
  }, [role]);

  const refreshRole = useCallback(async () => {
    if (user) {
      setIsRoleReady(false);
      await resolveRole(user);
    }
  }, [user, resolveRole]);

  useEffect(() => {
    let cancelled = false;

    authLog("Auth hydration started");

    // 1. Set up the auth state change listener FIRST (per Supabase docs)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (cancelled) return;
      authLog("Auth state change:", event, newSession?.user?.id ?? "no-user");

      const authUser = newSession?.user ?? null;
      setUser(authUser);
      setSession(newSession);

      if (authUser) {
        // Call without awaiting — avoids Supabase deadlock while starting
        // resolution immediately (no tick delay)
        if (!cancelled) resolveRole(authUser);
      } else {
        setRole(null);
        setIsRoleReady(true);
      }

      // Mark auth as ready after any auth event
      if (!cancelled) setIsAuthReady(true);
    });

    // 2. Restore session from storage
    supabase.auth.getSession().then(({ data: { session: restoredSession } }) => {
      if (cancelled) return;
      authLog("Initial session result:", restoredSession?.user?.id ?? "no-session");

      const authUser = restoredSession?.user ?? null;
      setUser(authUser);
      setSession(restoredSession);

      if (authUser) {
        resolveRole(authUser).then(() => {
          if (!cancelled) setIsAuthReady(true);
        });
      } else {
        setIsRoleReady(true);
        setIsAuthReady(true);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [resolveRole]);

  // Safety net: if auth is ready and user exists but role still hasn't resolved
  // within 2 seconds, force a re-attempt
  useEffect(() => {
    if (!isAuthReady || !user) return;
    if (isRoleReady) return;

    const timeout = setTimeout(() => {
      if (!isRoleReady && user) {
        authLog("Role resolution timeout — forcing re-attempt");
        resolveRole(user);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isAuthReady, user, isRoleReady, resolveRole]);

  const value: AuthContextValue = {
    isAuthReady,
    user,
    session,
    isAuthenticated: !!user,
    role,
    isRoleReady,
    isStaff: role === "therapist" || role === "admin" || role === "super_admin",
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access centralized auth state.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
