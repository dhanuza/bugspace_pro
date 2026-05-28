import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { 
  ShieldAlert, 
  Lock, 
  Users, 
  FileText, 
  Activity, 
  Zap,
  CheckCircle2,
  ArrowRight,
  Shield,
  Database,
  GitBranch,
  Menu,
  X,
  TrendingUp,
  Clock,
  AlertTriangle,
  Eye,
  Target,
  Layers
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/home")({
  component: LandingPage,
});

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Navigation */}
      <nav className="backdrop-blur-md bg-white/80 border-b border-slate-200/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-lg opacity-20 rounded-full"></div>
                <ShieldAlert className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600 relative" strokeWidth={2.5} />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-slate-900">Bugspace</span>
                <span className="text-purple-600">Pro</span>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
              <a href="#security" className="hover:text-slate-900 transition-colors">Security</a>
              <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
              <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:block">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
                  Get Started
                </Button>
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 pt-4 space-y-1">
              <a href="#features" className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#security" className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Security</a>
              <a href="#workflow" className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
              <a href="#pricing" className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="flex gap-2 pt-3">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-slate-900 text-white">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium shadow-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Trusted by 500+ Security Teams
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                  Vulnerability
                  <br />
                  Management
                  <br />
                  <span className="text-purple-600">Reimagined</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                  Centralize bug bounty programs, streamline triage workflows, and maintain complete audit trails—all in one powerful platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link to="/login">
                  <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 h-12 px-6 text-base">
                    Get Started
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 h-12 px-6 text-base">
                    Learn More
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-bold text-slate-900">99.9%</div>
                  <div className="text-xs text-slate-600 mt-1">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">50K+</div>
                  <div className="text-xs text-slate-600 mt-1">Reports Managed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-xs text-slate-600 mt-1">Support</div>
                </div>
              </div>
            </div>

            {/* Right Content - Clean High-Fidelity UI Match */}
            <div className="relative flex items-center justify-center lg:justify-end min-h-[400px] lg:min-h-[500px]">
              {/* Subtle background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-20 w-full max-w-[500px]">
                {/* Main Dashboard Card */}
                <div className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] z-10">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Program Overview</h3>
                        <p className="text-xs text-slate-500">Live vulnerability feeds</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 mb-1">Reports Triaged</div>
                      <div className="text-2xl font-black text-slate-900">1,204</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-xs font-medium text-slate-500 mb-1">Avg Response</div>
                      <div className="text-2xl font-black text-slate-900">1.2h</div>
                    </div>
                  </div>

                  {/* List */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Recent Submissions</div>
                    {[
                      { id: "#892", title: "Stored XSS in Comment Field", user: "@hunter_x", severity: "High", color: "text-orange-600 bg-orange-100" },
                      { id: "#891", title: "IDOR on User Settings", user: "@sec_ninja", severity: "Medium", color: "text-yellow-600 bg-yellow-100" },
                    ].map((report, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-purple-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="text-[10px] font-bold text-slate-400">{report.id}</div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{report.title}</div>
                            <div className="text-[10px] text-slate-500">{report.user}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${report.color}`}>
                          {report.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Element: Alert Notification (Bottom Left) */}
                <div className="absolute -bottom-6 -left-2 sm:-left-10 z-20 animate-float-delayed">
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xl border border-slate-200 flex items-center gap-2 sm:gap-3 w-52 sm:w-64">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-900">Critical Vulnerability Verified</div>
                      <div className="text-[10px] text-slate-500">Bounty awarded to @alex_h</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Platform Capabilities
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Built for Enterprise Security
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to run a world-class vulnerability disclosure program
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Role-Based Access Control"
              description="Granular permissions for admins, managers, employees, and security researchers with complete isolation."
              color="purple"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Immutable Audit Logs"
              description="Every action tracked and timestamped. Meet compliance requirements with complete traceability."
              color="blue"
            />
            <FeatureCard
              icon={<GitBranch className="h-6 w-6" />}
              title="Workflow Automation"
              description="From submission to triage to remediation—streamline your entire vulnerability lifecycle."
              color="green"
            />
            <FeatureCard
              icon={<Database className="h-6 w-6" />}
              title="Multi-Tenant Architecture"
              description="Secure, isolated environments for each organization. Scale from startup to enterprise."
              color="orange"
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Smart Triage System"
              description="Intelligent prioritization based on severity, impact, and exploitability scores."
              color="red"
            />
            <FeatureCard
              icon={<Layers className="h-6 w-6" />}
              title="Program Management"
              description="Manage multiple bug bounty programs with custom scopes, rewards, and policies."
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-14 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 to-purple-50/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Streamlined Security Workflow
            </h2>
            <p className="text-xl text-slate-600">
              From discovery to resolution in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <WorkflowStep
              number="01"
              title="Submit"
              description="Researchers submit vulnerabilities through a secure portal with detailed documentation."
            />
            <WorkflowStep
              number="02"
              title="Triage"
              description="Security teams review, validate, and prioritize reports based on severity and impact."
            />
            <WorkflowStep
              number="03"
              title="Remediate"
              description="Development teams receive actionable insights and track fixes through completion."
            />
            <WorkflowStep
              number="04"
              title="Verify"
              description="Validate fixes, reward researchers, and maintain comprehensive audit trails."
            />
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-20 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
              Trusted by Leading Organizations
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-10 lg:gap-16 flex-wrap">
            {['Tesla', 'Microsoft', 'Airtel', 'Paytm', 'CRED', 'Zomato', 'Razorpay'].map((company) => (
              <div key={company} className="text-lg sm:text-2xl font-bold text-slate-300 hover:text-slate-400 transition-colors">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden bg-slate-900 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Elevate Your Security Posture?
              </h2>
              <p className="text-xl text-slate-300 mb-10">
                Join hundreds of organizations managing their vulnerability programs with BugspacePro
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl h-14 px-8 text-base">
                    Start Free Trial
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" className="bg-transparent border-2 border-white !text-white hover:bg-white/10 h-14 px-8 text-base">
                  Schedule Demo
                </Button>
              </div>
              <p className="text-sm text-slate-400 mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 mb-10 sm:mb-12">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <ShieldAlert className="h-8 w-8 text-purple-400" strokeWidth={2.5} />
                <span className="text-2xl font-bold">
                  <span className="text-white">Bugspace</span>
                  <span className="text-purple-400">Pro</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Enterprise-grade vulnerability management platform designed for modern security teams who demand excellence.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 BugspacePro. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Status</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function MetricCard({ value, label, trend, positive, icon }: { 
  value: string; 
  label: string; 
  trend: string; 
  positive: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200">
      <div className="flex items-center justify-between mb-1">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
          {icon}
        </div>
        <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function ChartBar({ height, color, label }: { height: string; color: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5">
      <div className="w-full relative" style={{ height: '96px' }}>
        <div 
          className={`absolute bottom-0 w-full ${color} rounded-t-lg transition-all hover:opacity-80`}
          style={{ height }}
        ></div>
      </div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

function WorkflowStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 hover:shadow-lg transition-all h-full">
        <div className="text-5xl font-bold text-purple-100 mb-4">{number}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600',
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600',
    orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600',
    red: 'bg-red-100 text-red-600 group-hover:bg-red-600',
    indigo: 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600',
  };

  return (
    <div className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all">
      <div className={`mb-6 w-14 h-14 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center transition-all group-hover:text-white`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
