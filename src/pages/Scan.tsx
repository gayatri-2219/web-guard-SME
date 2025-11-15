import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, Loader2, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const Scan = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const handleScan = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsScanning(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-website`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ url, userId: user?.id }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Scan failed");
        setIsScanning(false);
        return;
      }

      const result = await response.json();
      navigate(`/dashboard?id=${result.id}`);
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan website. Please try again.");
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">WebGuard AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost">Back to Home</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary mb-6">
              <Search className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scan Your Website
            </h1>
            <p className="text-xl text-muted-foreground">
              Enter your website URL to start a comprehensive security analysis
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl animate-slide-up">
            <div className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-2">
                  Website URL
                </label>
                <Input
                  id="url"
                  type="text"
                  placeholder="example.com or https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleScan()}
                  className="h-14 text-lg"
                  disabled={isScanning}
                />
              </div>

              <Button
                onClick={handleScan}
                disabled={isScanning}
                size="lg"
                className="w-full gap-2 glow-effect"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Security Scan
                  </>
                )}
              </Button>
            </div>

            {isScanning && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Analyzing SSL certificate...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Checking security headers...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Testing for vulnerabilities...</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">8+</div>
              <div className="text-sm text-muted-foreground">Security Checks</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">&lt;10s</div>
              <div className="text-sm text-muted-foreground">Scan Time</div>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-3xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">Free</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
