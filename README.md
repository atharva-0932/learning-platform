# 🚀 SkillSphere: AI-Native Career Intelligence

**SkillSphere** is an agentic career platform designed to automate the job-seeking lifecycle. It orchestrates multiple AI agents to handle real-time interviews, automated networking, and application state management.

---

## 🌟 Key Features

### 🎙️ Voice AI Mock Interviews
Powered by **Vapi.ai** and **Deepgram**, SkillSphere conducts real-time technical interviews. It analyzes spoken responses with human-like latency (<800ms) and provides a post-interview performance breakdown using LLM-based evaluation.

### 🤖 Agentic Follow-Up Engine
A sophisticated **n8n Cloud** workflow that:
- Triggers via a custom Next.js frontend action.
- Analyzes Job Descriptions and Resume context via Vector embeddings.
- Uses **Gemini 1.5 Pro** to draft hyper-personalized recruiter emails.
- Features a "Human-in-the-Loop" verification step before final delivery.

### 📊 Smart Application Tracking
A centralized dashboard built with **Next.js 15** and **Supabase**, featuring:
- Real-time status synchronization (Applied, Interviewing, Follow-up Due).
- Automated "last contacted" tracking.
- Inline recruiter contact and metadata management.

---

## 🛠️ The Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS, Framer Motion |
| **UI Components** | Shadcn UI, Radix UI, Lucide Icons |
| **Backend/Auth** | Supabase (PostgreSQL), Next-Safe-Action |
| **Automation** | n8n Cloud (Managed Workflow Engine) |
| **Voice AI** | Vapi, Deepgram (STT), Cartesia (TTS) |
| **LLMs** | Gemini 1.5 Pro, GPT-4o, Llama 3.3 |

---

## 🏗️ Architecture & Data Flow

The project follows a **Decoupled Agentic Architecture**:

1. **User Action:** Next.js sends a secure payload to the n8n Cloud Webhook.
2. **Contextualization:** n8n fetches the latest application data and resume from Supabase.
3. **Generation:** AI Agents draft content based on a "High-Value Follow-up" system prompt.
4. **Response:** The workflow returns the draft to the UI for user review before final execution via Gmail API.

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# n8n Cloud
NEXT_PUBLIC_N8N_FOLLOW_UP_WEBHOOK_URL=[https://atharva-0932.app.n8n.cloud/webhook/job-follow-up](https://atharva-0932.app.n8n.cloud/webhook/job-follow-up)

# Vapi
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
