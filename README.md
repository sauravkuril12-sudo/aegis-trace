```markdown
# Aegis Trace 🛡️⚡

> **Autonomous Incident Investigation & Containment Platform for AI Agent Ecosystems**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://aegis-trace.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-646CFF)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.7%20Flash-4E75F6)](https://aistudio.google.com/)

Aegis Trace provides autonomous runtime containment, blast radius telemetry, and adversarial red-team counter-examinations to prevent cascading failures and unauthorized privilege escalation across enterprise AI agent fleets.

---

## 🚀 Key Features

* **Adversarial Red-Team Challenger (Gemini 3.7 Flash):** An automated counter-examiner that stress-tests primary incident hypotheses against correlated trace logs to prevent false positives and unnecessary fleet shutdowns.
* **Real-time Forensic SSE Streaming:** Streams real-time counter-examination reasoning, claim cross-checks, and verdict justifications directly to the console.
* **Blast Radius & Topology Engine:** Interactive dependency graphs and impact models powered by D3.js and Recharts to calculate micro-containment vs. fleet shutdown downtime.
* **Precision Micro-Containment:** Isolates rogue sub-agents or revocable tool permissions while keeping healthy production agent workflows online.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons
* **Data Visualizations:** D3.js, Recharts
* **Backend:** Node.js, Express, tsx, esbuild
* **AI Engine:** Google Gemini API (`@google/genai` — Gemini 3.7 Flash)
* **Deployment:** Render / Cloud Run

---

## 🏁 Quickstart

### Prerequisites

* [Node.js](https://nodejs.org/) (v20+ recommended)
* A [Google AI Studio Gemini API Key](https://aistudio.google.com/app/apikey)

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

Visit `http://localhost:3000` to interact with the application.

---

## 📡 API Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/health` | `GET` | Service status and Gemini configuration check |
| `/api/redteam/challenge` | `POST` | Executes Gemini adversarial counter-investigation on trace logs |
| `/api/redteam/stream` | `POST` | SSE endpoint for real-time streaming of red-team evaluations |
| `/api/blastradius/calculate` | `POST` | Dynamic topology blast radius and downtime projections |

---

## 📦 Production Deployment

### Build and Start

```bash
# Build frontend bundle & compile backend server
npm run build

# Start production server
npm start

```

### Environment Variables on Host (Render / Railway)

* `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio
* `NODE_ENV`: `production`

