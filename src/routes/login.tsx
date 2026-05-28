import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../store/auth";
import { ShieldAlert, Chrome, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { appUser, firebaseUser, loading, error, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated - let index route handle the logic
  useEffect(() => {
    if (!loading && firebaseUser) {
      // Redirect to index route which will handle proper routing based on role/status
      navigate({ to: "/" });
    }
  }, [firebaseUser, loading, navigate]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    // Navigation happens in the useEffect above once firebaseUser is set.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Landing Page - Top Left */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/home">
          <Button variant="ghost" className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
            Back to Landing Page
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-20 rounded-full"></div>
            <ShieldAlert className="h-8 w-8 text-purple-600 relative" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-slate-900">Bugspace</span>
            <span className="text-purple-600">Pro</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Welcome back</h2>
          <p className="text-sm text-slate-600 mb-8">
            Sign in with your organization Google account to continue.
          </p>

          {/* Error state */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Google Sign-In button */}
          <Button
            className="w-full gap-2 bg-slate-900 hover:bg-slate-800 text-white h-12 shadow-lg shadow-slate-900/20"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Chrome className="h-5 w-5" />
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </Button>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              Access is restricted to authorized organization members.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}
