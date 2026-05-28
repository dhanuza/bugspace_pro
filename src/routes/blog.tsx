import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Calendar, Clock, ArrowRight, Shield, Bug, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../store/auth";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

function BlogPage() {
  const { signOut, firebaseUser } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const posts = [
    {
      id: 1,
      title: "The Future of Vulnerability Management",
      excerpt: "How automated triage and AI are changing the landscape of cybersecurity for enterprise organizations.",
      category: "Trends",
      date: "May 15, 2026",
      readTime: "5 min read",
      author: "Security Team",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: "Common Pitfalls in Bug Bounty Programs",
      excerpt: "Learning from the mistakes of top tech companies to build a robust and ethical vulnerability disclosure program.",
      category: "Guides",
      date: "May 12, 2026",
      readTime: "8 min read",
      author: "Bugspace Pro",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 3,
      title: "Building a Culture of Security",
      excerpt: "Why security is everyone's responsibility and how to empower your employees to be the first line of defense.",
      category: "Culture",
      date: "May 10, 2026",
      readTime: "4 min read",
      author: "Product Team",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Shield className="h-6 w-6" />
            <span>Bugspace<span className="text-muted-foreground">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/home" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/blog" className="text-primary transition-colors border-b-2 border-primary pb-5 mt-5">Blog</Link>
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
            <BookOpen className="h-3 w-3" />
            <span>Company Blog</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto">
            Insights on <span className="text-primary">Cybersecurity</span> and Triage Excellence
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Welcome to Bugspace Pro. Your account is currently under review by our administrators. 
            In the meantime, explore our latest articles on vulnerability management.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2">
              Browse Articles <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Latest Posts</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-primary font-semibold">View All</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group bg-card border rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {post.author[0]}
                      </div>
                      <span className="text-xs font-medium">{post.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent text-primary gap-1">
                      Read More <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-24 bg-primary/5 border-y relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <Shield className="h-3 w-3" />
                <span>Access Request</span>
              </div>
              <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to join the elite security circle?</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Your account is currently in guest mode. Submit your details to request full platform access and start managing your security programs.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Access to exclusive bug bounty programs",
                  "Advanced vulnerability triage tools",
                  "Direct communication with security researchers",
                  "Detailed compliance and audit reporting"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border rounded-3xl p-8 shadow-2xl shadow-primary/5">
              <h3 className="text-xl font-bold mb-6">Request Platform Access</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</label>
                    <input 
                      type="text" 
                      placeholder="John" 
                      className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</label>
                    <input 
                      type="text" 
                      placeholder="Doe" 
                      className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email</label>
                  <input 
                    type="email" 
                    placeholder="john@company.com" 
                    defaultValue={firebaseUser?.email || ""}
                    className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preferred Role</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer">
                    <option value="researcher">Security Researcher</option>
                    <option value="manager">Organization Manager</option>
                    <option value="employee">Triage Employee</option>
                  </select>
                </div>
                <div className="pt-4">
                  <Button className="w-full py-6 text-base font-bold shadow-xl shadow-primary/20 rounded-xl">
                    Submit Access Request
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-4">
                  By submitting, you agree to our Terms of Service and Privacy Policy. 
                  Our team typically reviews requests within 24-48 hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>© 2026 Bugspace Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
