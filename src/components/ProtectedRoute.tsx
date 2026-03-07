import { Navigate } from "react-router-dom";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If set, the user must have one of these roles to access. Otherwise shows access denied. */
  requiredRoles?: AppRole[];
}

const AUTH_DEBUG = true;

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
  if (requiredRoles && !isRoleReady) {
    authLog("Waiting for role resolution...");
    return <LoadingSpinner message="Checking permissions..." />;
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
