# WebGuard-SME Security Scanner

[![Project Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## Table of Contents

1. [Introduction](#introduction)  
2. [Objective](#objective)  
3. [Features](#features)  
4. [Innovation & Use Case for SMEs](#innovation--use-case-for-smes)  
5. [Technical Stack](#technical-stack)  
6. [Architecture](#architecture)  
7. [Working & Workflow](#working--workflow)  
8. [Edge Function – Detailed Explanation](#edge-function--detailed-explanation)  
9. [Security Scoring Logic](#security-scoring-logic)  
10. [Database Schema](#database-schema)  
11. [Code Structure](#code-structure)  
12. [Setup Instructions](#setup-instructions)  
13. [API Reference](#api-reference)  
14. [Future Scope & Limitations](#future-scope--limitations)  
15. [Screenshots / UI Mockups](#screenshots--ui-mockups)  

---

## Introduction

**WebGuard-SME Security Scanner** is a lightweight web security scanning tool tailored for small and medium enterprises (SMEs). It provides a quick health check for websites, detects common vulnerabilities like XSS and SQL injection, and offers actionable AI-driven recommendations.  

Unlike large enterprise scanners, WebGuard-SME focuses on **simplicity, affordability, and practical insights**, enabling SMEs to improve their web security posture without complex infrastructure.

---

## Objective

* Provide an easy-to-use website security scanner for SMEs.  
* Detect common web vulnerabilities safely.  
* Offer AI-powered recommendations for remediation.  
* Maintain a history of scans in a Supabase database for progress tracking.  

---

## Features

* **Automated Security Checks**: SSL/TLS, HTTP headers, DNS resolution, basic XSS & SQLi detection.  
* **AI Recommendations**: Human-readable, actionable security guidance.  
* **Scan History**: Save scans per user for tracking improvements.  
* **Supabase Backend**: Secure storage and serverless edge functions.  
* **Non-Destructive Testing**: Safe for production sites.  

---

## Innovation & Use Case for SMEs

* SMEs often lack dedicated security teams.  
* WebGuard-SME provides **immediate insights** without expensive tools.  
* Tracks **security improvements over time** via dashboard.  
* Serves as a **learning and awareness tool** for small teams.  

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React + TypeScript | Interactive UI & dashboard |
| Styling | Tailwind CSS | Rapid, responsive styling |
| State/Data | React Query | Fetching, caching scan data |
| Backend | Supabase Edge Functions | Serverless scan logic |
| Database | Supabase PostgreSQL | Stores scan history & user data |
| AI Integration | Gemini-2.5 via API | Generates actionable recommendations |
| Hosting | Supabase / Vercel | Full stack deployment |

---

## Architecture

Frontend (React)
|
| POST /scan-website
v
Supabase Edge Function (Deno)
|
| Performs scan: SSL, headers, XSS, SQLi, DNS, WHOIS
|
v
Supabase DB (PostgreSQL)
|
| Stores scan results + AI recommendations
v
Dashboard UI (React)

---

## Working & Workflow

1. User submits a URL via the frontend.  
2. Frontend triggers **Supabase Edge Function** (`/scan-website`).  
3. Edge function validates URL, performs checks, computes security score.  
4. Generates AI-driven recommendations based on scan results.  
5. Saves results to **Supabase database**.  
6. Dashboard displays results, score, and suggested fixes.  

---

## Edge Function – Detailed Explanation

Your Supabase Edge Function is the **core scanning engine**. Steps:

### 1️⃣ Receive Request
```ts
const { url, userId } = await req.json();
Validates URL
Normalizes with https:// prefix
2️⃣ Initialize Supabase Client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
3️⃣ SSL Certificate Check
Sends HEAD request
Checks protocol (https:) and response status
Basic expiry check
4️⃣ Security Headers Check
Headers: Strict-Transport-Security, Content-Security-Policy, etc.
Lists present and missing headers
5️⃣ Vulnerability Checks
XSS: Tests reflected script injection
SQLi: Tests for SQL error keywords
Non-destructive tests only
6️⃣ DNS Check
Resolves hostname to IP using Deno.resolveDns
7️⃣ WHOIS Check (Simplified)
Returns placeholder info; external API recommended for full WHOIS
8️⃣ Security Score Calculation
Score starts at 100
Deduct points for:
SSL invalid → −20
Missing headers → −5 each
XSS → −15
SQLi → −15
9️⃣ AI Recommendations
Calls AI API (Gemini-2.5)
Provides actionable guidance: enable HSTS, CSP headers, parameterized queries
🔟 Save to Supabase
const { data, error } = await supabase
  .from("scans")
  .insert(scanResult)
  .select()
  .single();
Security Scoring Logic
Check	Deduction
SSL invalid	−20
Each missing header	−5
XSS found	−15
SQLi found	−15
Minimum score	0
Final score: 0–100, giving SMEs a quick measure of website security posture.
Database Schema
Table: scans
Column	Type	Description
id	UUID	Primary key
url	TEXT	Target URL
userId	UUID	Optional user ID
ssl	TEXT	SSL validation status
headers	JSON	Present/missing security headers
vulnerabilities	JSON	XSS / SQLi results
dns	TEXT	Resolved IP(s)
whois	JSON	Domain info
score	INT	Security score
ai_recommendations	TEXT	Human-readable guidance
created_at	TIMESTAMP	Auto-generated
Code Structure
webguard-sme/
│
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ hooks/
│  │  └─ App.tsx
│  └─ package.json
│
├─ functions/
│  └─ scan-website/
│     ├─ index.ts      # Edge function main logic
│     └─ utils.ts      # Helper functions
│
├─ supabase/
│  └─ migrations/     # DB setup scripts
│
├─ README.md
└─ .env.example
Setup Instructions
Clone repository:
git clone https://github.com/<username>/webguard-sme.git
cd webguard-sme
Install frontend dependencies:
cd frontend
npm install
npm run dev
Deploy Edge Function:
supabase functions deploy scan-website
Set environment variables:
SUPABASE_URL=<your-url>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
AI_API_KEY=<your-api-key>
Run locally (frontend + Edge Function) for testing.
API Reference
POST /functions/v1/scan-website
Body:

{
  "url": "https://example.com",
  "userId": "test"
}
Response:
{
  "url": "https://example.com",
  "score": 85,
  "ssl": "valid",
  "headers": { "present": [...], "missing": [...] },
  "vulnerabilities": { "xss": false, "sqli": false },
  "dns": ["123.123.123.123"],
  "whois": { "registrar": "Unknown", "created": "Unknown" },
  "ai_recommendations": ["Enable HSTS", "Add CSP header"]
}
Future Scope & Limitations
Future Enhancements:
Add deep SSL inspection & certificate expiry alerts
Integrate full WHOIS API
Expand vulnerability checks (CSRF, RCE, Open Redirect)
User authentication & multi-tenant support
Dashboard analytics & trend graphs
Limitations:
Basic vulnerability checks only (safe, non-destructive)
Simplified WHOIS & SSL checks
Designed for small/medium websites
Screenshots / UI Mockups
(Placeholder for screenshots — add images of dashboard, scan result pages, AI recommendations)
[Dashboard Screenshot]
[Scan Result Screenshot]
[AI Recommendation Screenshot]
License
MIT License © 2025
WebGuard-SME Security Scanner — empowering SMEs to secure their web presence easily and safely.

---

This README covers **everything Option C promised**:

* Full technical explanation  
* Supabase Edge Function workflow  
* AI integration  
* Database & code structure  
* Setup instructions, API reference, limitations, future scope  
* Placeholders for screenshots  

---

If you want, I can also generate a **ready-to-paste ASCII architecture + workflow diagram** for the README to make it visually appealing. It would replace the plain text architecture section.  

Do you want me to do that?
