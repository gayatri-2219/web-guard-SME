import { Button } from "@/components/ui/button";
import { Shield, Search, Lock, Zap, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary-glow)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--secondary)/0.15),transparent_50%)]" />
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">WebGuard AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/scan">
                <Button variant="ghost">Scan Now</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Security Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Protect Your Website</span>
              <br />
              <span className="text-foreground">From Cyber Threats</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive security scanning with SSL checks, vulnerability detection, 
              and AI-powered recommendations. Get your cyber health score in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/scan">
                <Button size="lg" className="gap-2 glow-effect group">
                  Start Free Scan
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                No signup required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Instant results
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Free forever
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Security <span className="gradient-text">Suite</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced scanning technology that checks every aspect of your website's security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-xl hover:shadow-glow transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="glass-card max-w-4xl mx-auto p-12 rounded-2xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Secure Your Website?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get instant security insights and actionable recommendations
            </p>
            <Link to="/scan">
              <Button size="lg" className="gap-2 glow-effect">
                Scan Your Website Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-semibold">WebGuard AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 WebGuard AI. Powered by AI security intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Lock,
    title: "SSL/TLS Analysis",
    description: "Comprehensive SSL certificate validation, expiration checks, and protocol security assessment",
  },
  {
    icon: Shield,
    title: "Security Headers",
    description: "Detect missing security headers like CSP, HSTS, X-Frame-Options and more",
  },
  {
    icon: Search,
    title: "XSS Detection",
    description: "Identify cross-site scripting vulnerabilities that could compromise your users",
  },
  {
    icon: Lock,
    title: "SQL Injection Test",
    description: "Test for SQL injection vulnerabilities that attackers could exploit",
  },
  {
    icon: BarChart3,
    title: "DNS & WHOIS Lookup",
    description: "Complete domain information including DNS records and registration details",
  },
  {
    icon: Zap,
    title: "AI Recommendations",
    description: "Get intelligent, prioritized fix recommendations powered by AI",
  },
];

export default Landing;
