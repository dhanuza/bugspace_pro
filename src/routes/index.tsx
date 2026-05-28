import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../store/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { appUser, firebaseUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!firebaseUser) {
      // Not logged in - redirect to home page
      navigate({ to: "/home" });
    } else if (!appUser || !appUser.role || appUser.status === "inactive") {
      // Logged in but no role assigned or inactive - redirect to blog
      navigate({ to: "/blog" });
    } else {
      // Logged in with role - redirect to role dashboard
      const roles: Record<string, any> = {
        admin: "/admin",
        manager: "/manager",
        researcher: "/researcher",
        employee: "/employee",
      };
      navigate({ to: roles[appUser.role] || "/" });
    }
  }, [appUser, firebaseUser, loading, navigate]);

  // Show a spinner while Firebase resolves the persisted session.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
