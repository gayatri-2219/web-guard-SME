import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScanResult {
  url: string;
  score: number;
  ssl_data: any;
  headers_data: any;
  vulnerabilities_data: any;
  dns_data: any;
  whois_data: any;
  recommendations: string[];
  user_id: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting scan for URL: ${url}`);

    // Normalize URL
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Perform security checks
    const sslData = await checkSSL(normalizedUrl);
    const headersData = await checkSecurityHeaders(normalizedUrl);
    const vulnerabilitiesData = await checkVulnerabilities(normalizedUrl);
    const dnsData = await checkDNS(normalizedUrl);
    const whoisData = await checkWHOIS(normalizedUrl);

    // Calculate security score
    const score = calculateSecurityScore({
      sslData,
      headersData,
      vulnerabilitiesData,
    });

    // Generate AI recommendations
    const recommendations = await generateRecommendations({
      url: normalizedUrl,
      score,
      sslData,
      headersData,
      vulnerabilitiesData,
    });

    const scanResult: ScanResult = {
      url: normalizedUrl,
      score,
      ssl_data: sslData,
      headers_data: headersData,
      vulnerabilities_data: vulnerabilitiesData,
      dns_data: dnsData,
      whois_data: whoisData,
      recommendations,
      user_id: userId || null,
    };

    // Store results in database
    const { data: insertData, error: insertError } = await supabase
      .from("scans")
      .insert(scanResult)
      .select()
      .single();

    if (insertError) {
      console.error("Error storing scan results:", insertError);
    }

    console.log(`Scan completed for ${normalizedUrl} with score: ${score}`);

    return new Response(
      JSON.stringify({ ...scanResult, id: insertData?.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scan-website function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function checkSSL(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const urlObj = new URL(url);
    
    return {
      valid: urlObj.protocol === "https:",
      protocol: urlObj.protocol,
      expires: "90 days", // Simplified - real implementation would check cert details
      issuer: "Unknown", // Would require TLS inspection
      status: response.ok ? "active" : "error",
    };
  } catch (error) {
    console.error("SSL check error:", error);
    return {
      valid: false,
      protocol: "unknown",
      expires: "unknown",
      issuer: "unknown",
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkSecurityHeaders(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const headers = response.headers;

    const securityHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
      "x-content-type-options",
      "x-xss-protection",
      "referrer-policy",
      "permissions-policy",
    ];

    const present: string[] = [];
    const missing: string[] = [];

    for (const header of securityHeaders) {
      if (headers.has(header)) {
        present.push(header);
      } else {
        missing.push(header);
      }
    }

    return { present, missing };
  } catch (error) {
    console.error("Headers check error:", error);
    return { present: [], missing: [], error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function checkVulnerabilities(url: string) {
  try {
    // Basic XSS check - test if site reflects input
    const xssPayload = "<script>test</script>";
    const testUrl = `${url}?test=${encodeURIComponent(xssPayload)}`;
    
    let xssVulnerable = false;
    try {
      const response = await fetch(testUrl);
      const text = await response.text();
      xssVulnerable = text.includes(xssPayload);
    } catch {
      xssVulnerable = false;
    }

    // Basic SQL injection check - test for error patterns
    const sqliPayload = "' OR '1'='1";
    const sqliUrl = `${url}?id=${encodeURIComponent(sqliPayload)}`;
    
    let sqliVulnerable = false;
    try {
      const response = await fetch(sqliUrl);
      const text = await response.text();
      const errorPatterns = ["SQL", "mysql", "syntax error", "ORA-", "PostgreSQL"];
      sqliVulnerable = errorPatterns.some(pattern => 
        text.toLowerCase().includes(pattern.toLowerCase())
      );
    } catch {
      sqliVulnerable = false;
    }

    return {
      xss: xssVulnerable,
      sqli: sqliVulnerable,
      csrf: false, // Placeholder
    };
  } catch (error) {
    console.error("Vulnerability check error:", error);
    return { xss: false, sqli: false, csrf: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function checkDNS(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Use Deno's native DNS resolution
    const records: string[] = [];
    
    try {
      const addresses = await Deno.resolveDns(hostname, "A");
      addresses.forEach(addr => records.push(`A: ${addr}`));
    } catch {
      records.push("A: Unable to resolve");
    }

    return { records, hostname };
  } catch (error) {
    console.error("DNS check error:", error);
    return { records: [], hostname: "", error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function checkWHOIS(url: string) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Simplified WHOIS data - real implementation would query WHOIS servers
    return {
      registrar: "Unknown",
      created: "Unknown",
      expires: "Unknown",
      domain: hostname,
      note: "WHOIS lookup requires external API or service",
    };
  } catch (error) {
    console.error("WHOIS check error:", error);
    return {
      registrar: "Unknown",
      created: "Unknown",
      expires: "Unknown",
      domain: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function calculateSecurityScore(data: any): number {
  let score = 100;

  // SSL/TLS (20 points)
  if (!data.sslData.valid) {
    score -= 20;
  }

  // Security Headers (25 points)
  const headersPenalty = Math.min(25, data.headersData.missing.length * 5);
  score -= headersPenalty;

  // Vulnerabilities (30 points)
  if (data.vulnerabilitiesData.xss) {
    score -= 15;
  }
  if (data.vulnerabilitiesData.sqli) {
    score -= 15;
  }

  return Math.max(0, Math.round(score));
}

async function generateRecommendations(data: any): Promise<string[]> {
  try {
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not found");
      return generateBasicRecommendations(data);
    }

    const prompt = `You are a cybersecurity expert. Based on this security scan, provide 3-5 prioritized, actionable recommendations:

URL: ${data.url}
Security Score: ${data.score}/100
SSL Valid: ${data.sslData.valid}
Missing Headers: ${data.headersData.missing.join(", ")}
XSS Vulnerability: ${data.vulnerabilitiesData.xss ? "Yes" : "No"}
SQL Injection Risk: ${data.vulnerabilitiesData.sqli ? "Yes" : "No"}

Provide concise, specific recommendations. Each should be one clear sentence.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert providing actionable security recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI API error:", response.status);
      return generateBasicRecommendations(data);
    }

    const aiResponse = await response.json();
    const recommendations = aiResponse.choices[0].message.content
      .split("\n")
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 5);

    return recommendations.length > 0 ? recommendations : generateBasicRecommendations(data);
  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    return generateBasicRecommendations(data);
  }
}

function generateBasicRecommendations(data: any): string[] {
  const recommendations: string[] = [];

  if (!data.sslData.valid) {
    recommendations.push("Install a valid SSL/TLS certificate immediately to secure data transmission");
  }

  if (data.headersData.missing.length > 0) {
    recommendations.push(
      `Add missing security headers: ${data.headersData.missing.slice(0, 3).join(", ")}`
    );
  }

  if (data.vulnerabilitiesData.xss) {
    recommendations.push("Implement input validation and output encoding to prevent XSS attacks");
  }

  if (data.vulnerabilitiesData.sqli) {
    recommendations.push("Use parameterized queries and prepared statements to prevent SQL injection");
  }

  if (data.score < 80) {
    recommendations.push("Conduct a comprehensive security audit to identify additional vulnerabilities");
  }

  return recommendations.length > 0
    ? recommendations
    : ["Your website has good security practices. Continue monitoring regularly."];
}
