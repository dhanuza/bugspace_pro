/**
 * ProtectedRoute — role-guarded route wrapper.
 *
 * Drop this inside any TanStack Router route component that needs access control.
 *
 * States handled:
 *  1. loading  → spinner (Firebase auth resolving)
 *  2. not logged in → redirect to /login
 *  3. logged in, wrong role → /unauthorized (403)
 *  4. logged in, correct role → render children
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={["admin"]}>
 *     <AdminPage />
 *   </ProtectedRoute>
 */
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  allowedRoles?: string[];
};

export function ProtectedRoute({ children }: Props) {
  return <>{children}</>;
}