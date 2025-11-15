import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ScoreCard from "@/components/ScoreCard";
import SecurityCheckCard from "@/components/SecurityCheckCard";
import RecommendationsList from "@/components/RecommendationsList";
import { toast } from "sonner";

interface ScanResult {
  url: string;
  score: number;
  ssl: {
    valid: boolean;
    expires: string;
    issuer: string;
  };
  headers: {
    present: string[];
    missing: string[];
  };
  vulnerabilities: {
    xss: boolean;
    sqli: boolean;
    csrf: boolean;
  };
  dns: {
    records: string[];
  };
  whois: {
    registrar: string;
    created: string;
    expires: string;
  };
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      fetchScanResult(id);
    }
  }, [searchParams]);

  const fetchScanResult = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching scan:", error);
        toast.error("Failed to load scan results");
        setIsLoading(false);
        return;
      }

      if (data) {
        setScanResult({
          url: data.url,
          score: data.score,
          ssl: data.ssl_data as any,
          headers: data.headers_data as any,
          vulnerabilities: data.vulnerabilities_data as any,
          dns: data.dns_data as any,
          whois: data.whois_data as any,
        });
        setRecommendations((data.recommendations || []) as string[]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load scan results");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Analyzing security...</p>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">No scan results found</p>
          <Link to="/scan">
            <Button className="mt-4">Start New Scan</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold gradient-text">WebGuard AI</span>
            </Link>
            <Link to="/scan">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                New Scan
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* URL Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Security Report</h1>
          <p className="text-lg text-muted-foreground break-all">{scanResult.url}</p>
        </div>

        {/* Score Overview */}
        <div className="mb-12 animate-slide-up">
          <ScoreCard score={scanResult.score} />
        </div>

        {/* Security Checks Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <SecurityCheckCard
            title="SSL/TLS Certificate"
            status={scanResult.ssl.valid ? "success" : "error"}
            icon={scanResult.ssl.valid ? CheckCircle2 : XCircle}
            details={[
              `Valid: ${scanResult.ssl.valid ? "Yes" : "No"}`,
              `Expires: ${scanResult.ssl.expires}`,
              `Issuer: ${scanResult.ssl.issuer}`,
            ]}
          />

          <SecurityCheckCard
            title="Security Headers"
            status={scanResult.headers.missing.length === 0 ? "success" : "warning"}
            icon={scanResult.headers.missing.length === 0 ? CheckCircle2 : AlertTriangle}
            details={[
              `Present: ${scanResult.headers.present.length}`,
              `Missing: ${scanResult.headers.missing.length}`,
              ...scanResult.headers.missing.slice(0, 2).map((h) => `- ${h}`),
            ]}
          />

          <SecurityCheckCard
            title="XSS Vulnerability"
            status={scanResult.vulnerabilities.xss ? "error" : "success"}
            icon={scanResult.vulnerabilities.xss ? AlertTriangle : CheckCircle2}
            details={[
              scanResult.vulnerabilities.xss
                ? "Potential XSS vulnerability detected"
                : "No XSS vulnerabilities found",
            ]}
          />

          <SecurityCheckCard
            title="SQL Injection"
            status={scanResult.vulnerabilities.sqli ? "error" : "success"}
            icon={scanResult.vulnerabilities.sqli ? AlertTriangle : CheckCircle2}
            details={[
              scanResult.vulnerabilities.sqli
                ? "Potential SQL injection vulnerability"
                : "No SQL injection vulnerabilities found",
            ]}
          />

          <SecurityCheckCard
            title="DNS Records"
            status="info"
            icon={Info}
            details={scanResult.dns.records.slice(0, 3)}
          />

          <SecurityCheckCard
            title="WHOIS Information"
            status="info"
            icon={Info}
            details={[
              `Registrar: ${scanResult.whois.registrar}`,
              `Created: ${scanResult.whois.created}`,
              `Expires: ${scanResult.whois.expires}`,
            ]}
          />
        </div>

        {/* Recommendations */}
        <RecommendationsList 
          recommendations={recommendations} 
          scanData={{ url: scanResult.url, score: scanResult.score }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
