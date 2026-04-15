# 🚀 SkillCrew

**Autonomous AI-driven learning platform that transforms learner onboarding, planning, content curation, assessment, and motivation into one intelligent experience.**

Built by **Team Antigravity**, SkillCrew is a full-stack, multi-agent scaffold designed to move beyond static courses and isolated chatbots, creating a continuous, adaptive learning loop.



## 🧠 What is SkillCrew?

SkillCrew is a modern learning ecosystem powered by **five specialized autonomous agents**. It combines a high-concurrency FastAPI backend with a reactive Next.js 16 frontend to automate the entire educational lifecycle:

* **Intelligent Onboarding:** Extracting intent and experience from resumes and LinkedIn profiles.
* **Adaptive Architecting:** Building and revising multi-week roadmaps based on real-time performance.
* **Smart Curation:** Discovering high-quality resources (YouTube, Coursera, etc.) tailored to the learner's pace.
* **Active Retention:** Implementing spaced-repetition and automated memory reinforcement workflows.
* **Motivational Nudges:** Multi-channel engagement via WhatsApp, SMS, and Email to maintain momentum.



## 🤖 The Agentic Squad

The core of SkillCrew is built around five distinct AI personas, each responsible for a specific domain of the learner journey:

| Agent | Persona | Responsibility |
| :--- | :--- | :--- |
| **Nova** | Intake Specialist | Parses resumes/LinkedIn to create the canonical learner profile. |
| **Archie** | The Architect | Designs and dynamically revises milestone-based learning roadmaps. |
| **Dexter** | Resource Curator | Discovers and ranks learning resources from across the web. |
| **Pip** | Memory Guardian | Generates active recall quizzes and spaced-repetition revision packs. |
| **Sparky** | Motivation Coach | Sends motivational nudges and gamified alerts via Twilio/Resend. |

---

## ✨ Key Features & USPs

* **Unified End-to-End Flow:** Seamlessly transitions from onboarding to assessment and roadmap adaptation.
* **Profile-Aware Personalization:** Bridges the specific gap between your professional history and target role.
* **Domain-Agnostic Planning:** Structures milestones for any field—from software engineering to digital marketing.
* **Adaptive Feedback Loop:** If a quiz shows weakness, Archie automatically revises upcoming modules.
* **Integrated Assessment:** Quizzes aren't just for grades; they are signals that feed back into the learning logic.


## 🛠 Tech Stack

### **Frontend**
* **Framework:** Next.js 16 (App Router), React 19
* **Styling:** Tailwind CSS, Lucide React
* **Animations:** Framer Motion (Scroll-linked "scrollytelling")
* **State/Auth:** Supabase, Zod

### **Backend**
* **Framework:** FastAPI, Uvicorn, Pydantic
* **LLMs:** Google Gemini (1.5 Pro/Flash), Groq (Llama 3)
* **Search & Ingestion:** Apify (LinkedIn Scraping), Tavily Search API
* **Communications:** Twilio (WhatsApp/SMS), Resend / SendGrid (Email)
* **Media:** YT-DLP, YouTube-Transcript-API



## 📐 Technical Architecture

```mermaid
graph TD
    A[User/Resume] -->|Nova| B(Learner Profile)
    B -->|Archie| C(Dynamic Roadmap)
    C -->|Dexter| D(Curated Content)
    D -->|Pip| E(Assessment/Retention)
    E -->|Feedback Loop| C
    E -->|Sparky| F[WhatsApp/Email Notifications]
