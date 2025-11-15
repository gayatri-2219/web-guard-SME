# web-guard-SME
SUPABASE EDGE FUNCTION WORKS — FULL EXPLANATION
Your function is deployed here:
https://<project-id>.supabase.co/functions/v1/scan-website
When the frontend sends a POST request (via fetch or Curl):
{
  "url": "example.com",
  "userId": "test"
}
Then the edge function performs the following actions in sequence:
1️⃣ Receive Request
Deno receives the request:
const { url, userId } = await req.json();
🔹 Validates URL
🔹 Normalizes it → ensures it starts with https://
2️⃣ Initialize Supabase Client
The function runs on Supabase servers. It loads your environment variables:
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);
These keys let the function:
✔ read/write to database
✔ generate recommendations using AI API
✔ run securely (not exposed to users)
3️⃣ SSL Certificate Check
Function sends a HEAD request to the site:
const response = await fetch(url, { method: "HEAD" });
const protocol = new URL(url).protocol;
Checks:
Check	How?
HTTPS or not	urlObj.protocol === 'https:'
Certificate valid?	If site responds properly
Expiry	Hardcoded “90 days” (simple version)
Issuer	Set as “Unknown” (because Deno cannot inspect certs deeply)
Server responded OK?	response.ok
🔹 This is a basic SSL check, not a deep scan.
🔹 Good enough for student/SME projects.
4️⃣ Security Headers Check
Again sends a HEAD request:
const response = await fetch(url, { method: "HEAD" });
const headers = response.headers;
Your code checks if these are present:
[
  "strict-transport-security",
  "content-security-policy",
  "x-frame-options",
  "x-content-type-options",
  "x-xss-protection",
  "referrer-policy",
  "permissions-policy"
]
For each header:
if (headers.has(header)) {
    present.push(header)
} else {
    missing.push(header)
}
This gives:
✔ A list of present security headers
✔ A list of missing ones
This affects the security score.
5️⃣ Vulnerability Checks (Basic)
You implemented two simple automated tests:
A. XSS Test
Injects this payload:
const xssPayload = "<script>test</script>";
const testUrl = `${url}?test=${encodeURIComponent(xssPayload)}`;
const response = await fetch(testUrl);
const text = await response.text();
If that payload comes back in the page:
xssVulnerable = text.includes(xssPayload)
➡ Means page may reflect user input → XSS danger.
B. SQL Injection Test
Payload:
const sqliPayload = "' OR '1'='1";
const response = await fetch(`${url}?id=${payload}`);
const text = await response.text();
Checks if the response contains SQL error keywords:
SQL, mysql, syntax error, ORA-, PostgreSQL
If yes → high chance of SQLi vulnerability.
✔ These are safe, non-destructive tests
✔ Not full penetration testing, but enough for demonstration
6️⃣ DNS Check
Deno has built-in DNS resolution:
const addresses = await Deno.resolveDns(hostname, "A");
This returns list of IPv4 addresses.
If DNS fails → returns “Unable to resolve”.
✔ No external APIs needed
✔ Fast and safe
7️⃣ WHOIS Check (Simplified)
You don’t call external WHOIS servers (expensive + blocked often).
So you return:
{
  registrar: "Unknown",
  created: "Unknown",
  expires: "Unknown",
  domain: hostname,
  note: "WHOIS lookup requires external API"
}
This is acceptable for student + SME-level tools.
8️⃣ Calculate Security Score
Your function combines findings into a score:
let score = 100;
Deduct points:
SSL invalid → −20
Each missing header → −5 (max −25)
XSS found → −15
SQLi found → −15
Score never goes below 0.
9️⃣ AI Recommendations
This is the best part of your project.
You generate a detailed prompt:
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  model: "google/gemini-2.5-flash",
});
You pass:
URL
Score
Missing security headers
Vulnerabilities
SSL status
AI returns human-readable, actionable recommendations like:
“Enable HSTS to enforce HTTPS.”
“Add Content-Security-Policy header to reduce XSS risks.”
“Implement parameterized SQL queries.”
This makes your tool feel like a real security expert.
🔟 Save to Supabase Database
Final result:
const { data, error } = await supabase
  .from("scans")
  .insert(scanResult)
  .select()
  .single();
Database stores:
url
score
SSL result
Headers result
Vulnerabilities
DNS
WHOIS
AI recommendations
userId (optional)
timestamp (auto)
Why save to DB?
Shows scan history in dashboard
Allows tracking progress
Makes your tool look professional
