import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../store/auth";
import { Clock, ShieldAlert, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/waiting-approval")({
  component: WaitingApprovalPage,
});

function WaitingApprovalPage() {
  const { firebaseUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
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
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
              <Clock className="h-10 w-10 text-yellow-600" strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3 text-center">
            Account Pending Approval
          </h2>
          
          <p className="text-slate-600 text-center mb-6">
            Your account is waiting for administrator approval and role assignment.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Email:</span>
                <span className="text-slate-900 font-medium">{firebaseUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="text-yellow-600 font-semibold">Pending</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-bold text-slate-900">What happens next?</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5 font-bold">•</span>
                <span>An administrator will review your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5 font-bold">•</span>
                <span>You'll be assigned an appropriate role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5 font-bold">•</span>
                <span>You'll receive access to the platform</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700 text-center">
              You'll be notified via email once your account is approved.
              This usually takes 1-2 business days.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 h-11"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact your organization administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
