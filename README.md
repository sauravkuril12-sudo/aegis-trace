```markdown
# Aegis Trace 🛡️⚡

Autonomous incident investigation and containment platform for AI agent ecosystems[cite: 4, 5].

🔗 **Live Deployment:** [https://aegis-trace.onrender.com](https://aegis-trace.onrender.com)

Aegis Trace provides autonomous runtime containment, blast radius telemetry, and adversarial red-team counter-examinations to prevent cascading failures and unauthorized privilege escalation across enterprise AI agent fleets[cite: 4, 5].

---

## Key Capabilities

* **Adversarial Red-Team Challenger (Gemini 3.7 Flash):** An automated counter-examiner that stress-tests primary incident hypotheses against correlated trace logs to prevent false positives and unnecessary fleet shutdowns.
* **Real-time Forensic SSE Streaming:** Streams real-time counter-examination reasoning, claim cross-checks, and verdict justifications directly to the console.
* **Blast Radius & Topology Engine:** Interactive dependency graphs and impact models powered by D3.js and Recharts to calculate micro-containment vs. fleet shutdown downtime[cite: 3, 6].
* **Precision Micro-Containment:** Isolates rogue sub-agents or revocable tool permissions while keeping healthy production agent workflows online.

---

## Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons[cite: 3, 6]
* **Data Visualizations:** D3.js, Recharts[cite: 3, 6]
* **Backend:** Node.js, Express, tsx, esbuild[cite: 3, 6]
* **AI Engine:** Google Gemini API (`@google/genai` — Gemini 3.7 Flash)[cite: 3, 6]
* **Hosting Platform:** Render

---

## Getting Started

### Prerequisites

* Node.js (v20+ recommended)[cite: 7]
* A Google AI Studio Gemini API Key[cite: 7]

### 1. Clone & Install

```bash
git clone [https://github.com/sauravkuril12-sudo/aegis-trace.git](https://github.com/sauravkuril12-sudo/aegis-trace.git)
cd aegis-trace
npm install

```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=3000
NODE_ENV=development

```

### 3. Run Locally

```bash
npm run dev

```

Visit `http://localhost:3000` to access the application locally.

---

## API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | `GET` | Service health status and Gemini configuration check |
| `/api/redteam/challenge` | `POST` | Executes Gemini adversarial counter-investigation on trace logs |
| `/api/redteam/stream` | `POST` | Server-Sent Events (SSE) endpoint for real-time streaming evaluations |
| `/api/blastradius/calculate` | `POST` | Dynamic topology blast radius and downtime projections |

---

## Production Deployment

### Build & Start Commands

```bash
# Build frontend bundle & compile server
npm run build

# Start production server
npm start

```

### Host Environment Variables

* `GEMINI_API_KEY`: Google AI Studio Gemini API Key


* `NODE_ENV`: `production`

