import { supabase } from "@/integrations/supabase/client";

export type UserRole = "patient" | "therapist" | "admin" | "super_admin";

export interface AuthCheckResult {
  isAuthenticated: boolean;
  userId: string | null;
  role: UserRole | null;
  isTherapist: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Check current user's authentication and role status
 */
export async function checkAuth(): Promise<AuthCheckResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return {
      isAuthenticated: false,
      userId: null,
      role: null,
      isTherapist: false,
      isAdmin: false,
      isSuperAdmin: false,
    };
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userData?.role as UserRole | null;

  return {
    isAuthenticated: true,
    userId: user.id,
    role,
    isTherapist: role === "therapist" || role === "admin" || role === "super_admin",
    isAdmin: role === "admin" || role === "super_admin",
    isSuperAdmin: role === "super_admin",
  };
}

/**
 * Check if user can access therapist routes
 */
export function canAccessTherapistRoutes(role: UserRole | null): boolean {
  return role === "therapist" || role === "admin" || role === "super_admin";
}

/**
 * Check if user can access admin routes
 */
export function canAccessAdminRoutes(role: UserRole | null): boolean {
  return role === "admin" || role === "super_admin";
}

/**
 * Check if user can access super admin only routes
 */
export function canAccessSuperAdminRoutes(role: UserRole | null): boolean {
  return role === "super_admin";
}

/**
 * Routes that require super_admin role
 */
export const SUPER_ADMIN_ONLY_ROUTES = [
  "/admin/master",
  "/admin/super-admins",
  "/admin/delete-patients",
];

/**
 * Routes that require admin or super_admin role
 */
export const ADMIN_ROUTES = [
  "/admin/content",
  "/admin/seed-program",
  "/admin/update-weeks-1-2",
  "/admin/update-weeks-3-4",
  "/admin/update-weeks-5-6",
  "/admin/media-audit",
];

/**
 * Check if a specific route requires super admin
 */
export function requiresSuperAdmin(pathname: string): boolean {
  return SUPER_ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
}
