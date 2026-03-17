import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, the user must have one of these roles to access. Otherwise shows access denied. */
  requiredRoles?: AppRole[];
}

const AUTH_DEBUG = false;

function authLog(...args: any[]) {
  if (AUTH_DEBUG) {
    console.log("[ProtectedRoute]", ...args);
  }
}

/**
 * Wraps authenticated routes. Behavior:
 * - If auth is loading → show spinner (NEVER redirect)
 * - If auth is ready and no user → redirect to /auth
 * - If authenticated but role still loading → show spinner
 * - If authenticated but unauthorized (wrong role) → show access denied
 * - If authenticated and authorized → render children
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthReady, isAuthenticated, isRoleReady, role } = useAuth();

  const permissionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [permissionTimedOut, setPermissionTimedOut] = useState(false);

  // Start timer ONCE on mount — empty dep array prevents re-starting on re-renders
  useEffect(() => {
    if (permissionTimedOut) return;
    if (isRoleReady) return;
    if (!isAuthenticated) return;

    permissionTimeoutRef.current = setTimeout(() => {
      authLog("Permission check timeout — forcing resolution");
      setPermissionTimedOut(true);
    }, 3000);

    return () => {
      if (permissionTimeoutRef.current) {
        clearTimeout(permissionTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear timeout when role resolves
  useEffect(() => {
    if (isRoleReady && permissionTimeoutRef.current) {
      clearTimeout(permissionTimeoutRef.current);
      setPermissionTimedOut(false);
    }
  }, [isRoleReady]);

  // Still hydrating auth — show loading, NEVER redirect
  if (!isAuthReady) {
    authLog("Waiting for auth hydration...");
    return <LoadingSpinner message="Authenticating..." />;
  }

  // Auth is ready, no user — redirect to login
  if (!isAuthenticated) {
    authLog("No authenticated user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated but role is still resolving
  if (requiredRoles && !isRoleReady && !permissionTimedOut) {
    authLog("Waiting for role resolution...");
    return <LoadingSpinner message="Checking permissions..." />;
  }

  // Role resolved to null — user has no role assigned
  if (requiredRoles && isRoleReady && !role) {
    authLog("Role resolved to null — no role assigned for this user.");
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Account Setup Incomplete</h1>
          <p className="text-muted-foreground">
            Your account doesn't have a role assigned yet. Please contact
            your administrator.
          </p>
          <a href="/auth" className="text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRoles && role && !requiredRoles.includes(role)) {
    authLog("Access denied. User role:", role, "Required:", requiredRoles);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to view this page.
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
