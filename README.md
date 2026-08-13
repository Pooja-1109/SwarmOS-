# SwarmOS 🚀
> **AI Agent Teams for Autonomous Software Development**

SwarmOS is an open-source, AI-powered multi-agent software development platform. Instead of relying on a single AI assistant to write fragmented code snippets, SwarmOS orchestrates a team of specialized AI agents to plan, architect, design, code, test, and run full-stack web applications from natural language prompts.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Innovations](#-key-innovations)
- [How SwarmOS Works](#-how-swarmos-works)
- [Multi-Agent Workforce Roster](#-multi-agent-workforce-roster)
- [Core Features](#-core-features)
- [Generated Project Runtime](#-generated-project-runtime)
- [Conversational Development Workflow](#-conversational-development-workflow)
- [Knowledge Base & RAG Foundation](#-knowledge-base--rag-foundation)
- [WhatsApp Integration Architecture](#-whatsapp-integration-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Recommended Hackathon Demo Walkthrough](#-recommended-hackathon-demo-walkthrough)
- [Current MVP Status](#-current-mvp-status)
- [Future Scope](#-future-scope)
- [Security & Environmental Safety](#-security--environmental-safety)

---

## 💡 Overview

SwarmOS transforms natural language software requirements into production-ready software artifacts. When a user requests a software application (such as a *Library Management System* or *Student Attendance Tracker*), SwarmOS assembles a team of AI agents—including an **Orchestrator**, **Planner**, **Architect**, **UI/UX Designer**, **Developer**, **Tester**, and **Documentation Specialist**—to execute real task workflows, generate structured source code, and host the application locally for instant execution.

---

## 🎯 The Problem

Traditional AI coding assistants operate as single-turn chat boxes. Users are forced to manually prompt one assistant for initial ideas, copy-paste code blocks, fix broken imports, write test suites, and configure local servers manually. This leads to:
1. **Context Fragmentation:** The AI forgets architectural choices made earlier.
2. **Manual Integration Overhead:** Developers waste hours gluing disconnected snippets together.
3. **No Execution Guarantee:** AI-generated code is rarely tested or hosted autonomously.

---

## ✨ The Solution

SwarmOS solves this by structuring software development as an autonomous **Agent Swarm Workflow**:

```text
               User Prompt / Requirement
                          │
                          ▼
              🧠 ORCHESTRATOR AGENT
        (Analyzes prompt & dispatches tasks)
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
📋 PLANNER AGENT  🏗 ARCHITECTURE AGENT  🎨 UI/UX AGENT
 (Creates PRD)     (System Architecture)  (Design Specs)
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                💻 DEVELOPER AGENT
            (Generates Full Source Code)
                          │
       ┌──────────────────┴──────────────────┐
       ▼                                     ▼
🧪 TESTER AGENT                   📚 DOCUMENTATION AGENT
 (QA Scan & Tests)                  (Tech Documentation)
       │                                     │
       └──────────────────┬──────────────────┘
                          ▼
            📁 MATERIALIZED PROJECT FILES
                          │
                          ▼
            ▶ RUNNABLE EXPRESS RUNTIME URL
              (http://localhost:5000/runtime/:id/)
```

---

## 🚀 Key Innovations

- **Autonomous Agent Swarm Topology:** Division of labor across specialized AI personas rather than one overloaded LLM context window.
- **Persistent Project Memory & History:** All project files, agent activities, execution logs, and chat messages are persisted in MongoDB.
- **Express-Based Local Project Runtime:** Materializes generated applications on disk and serves them dynamically on host routes without requiring complex process sandboxing.
- **Conversational Refinement:** Refine generated applications naturally via chat (e.g. *"Add admin login"*, *"Make it dark"*).
- **Multi-Channel Architecture:** Extensible integration layer designed for web dashboards and messaging platforms like WhatsApp.

---

## 🤖 Multi-Agent Workforce Roster

| Agent Icon | Agent Name | Primary Responsibility | Output Artifact |
| :--- | :--- | :--- | :--- |
| 🧠 | **Orchestrator Agent** | Analyzes prompts, breaks down scope, coordinates agent dispatch | Execution Plan & Task Graph |
| 📋 | **Planner Agent** | Drafts Product Requirement Documents (PRD) & user stories | `PRD.md` |
| 🏗 | **Architecture Agent** | Designs data models, component hierarchy, and API schemas | `ARCHITECTURE.md` |
| 🎨 | **UI/UX Agent** | Defines design tokens, layout structures, and styling guides | `UI_DESIGN_SPEC.md`, `styles.css` |
| 💻 | **Developer Agent** | Writes clean, full-stack application code | `index.html`, `app.js`, `package.json` |
| 🧪 | **Tester Agent** | Generates automated test suites & quality assurance reports | `tests/app.test.js`, `QA_REPORT.md` |
| 📚 | **Documentation Agent** | Formats technical manuals and setup documentation | `README.md` |

---

## 🛠 Core Features

1. **Authentication & User Workspace:** JWT-authenticated user registration and login with persistent project isolation.
2. **Dynamic Project Generation:** Generates domain-tailored software based on user prompt requirements (Library Systems, Attendance Portals, SaaS Dashboards, etc.).
3. **Real-Time Agent Execution Feed:** Real-time visibility into agent task execution, progress percentages, and activity logs.
4. **Interactive File Explorer:** Inspect generated PRDs, architecture specifications, HTML/CSS/JS code, and test suites with syntax highlighting and instant copy.
5. **Live App Preview & Runtime:** Built-in preview tab and one-click **[ ▶ Run Project ]** execution button.
6. **One-Click ZIP Export:** Export the complete generated project codebase as a `.zip` package.
7. **Conversational AI Assistant:** Natural chat interface to instruct, modify, and expand existing projects.
8. **Knowledge Base Foundation:** Document upload and RAG context indexing foundation for custom project specs.

---

## 🌐 Generated Project Runtime

When you click **[ ▶ Run Project ]**, SwarmOS performs the following steps:
1. Fetches all generated `ProjectFile` records from MongoDB.
2. Materializes them into a project-specific directory (`backend/runtime-projects/<projectId>/`).
3. Registers dynamic static routes on the existing SwarmOS backend server.
4. Serves the application cleanly at:
   `http://localhost:5000/runtime/<projectId>/`

This ensures **100% reliable local execution** without child process connection failures.

---

## 💬 Conversational Development Workflow

SwarmOS supports iterative application refinement through a natural chat interface:

- **User:** *"i want to build a library management website"*
  - **SwarmOS:** *"Sure 😊 What kind of library system do you want? For example, we could have: • books • members • issue & return • overdue tracking • reports."*
- **User:** *"add admin login also"*
  - **SwarmOS:** *"Yep, we can do that. I'll add admin login and an admin dashboard to the project."* *(Triggers Developer Agent & regenerates files)*
- **User:** *"and make it dark"*
  - **SwarmOS:** *"Sure — I'll make the dashboard and main pages dark too."* *(Updates UI styling specs & materializes new build)*

---

## 📚 Knowledge Base & RAG Foundation

SwarmOS includes a Knowledge Base module where users can upload spec PDFs or requirements TXT files. These documents are stored alongside project metadata to provide context for AI agents during generation. Full vector database embeddings (e.g. Pinecone/Weaviate) represent a planned future extension.

---

## 📱 WhatsApp Integration Architecture

SwarmOS features an extensible messaging channel adapter (`channelService.js` & `externalChannelController.js`). The core chat engine handles incoming webhooks and standardizes incoming payloads from external providers. Live production messaging requires user Meta WhatsApp API tokens (`WHATSAPP_TOKEN` & `WHATSAPP_PHONE_NUMBER_ID`).

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Vanilla CSS
- **Icons:** Lucide React
- **Routing:** React Router v6

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **HTTP Client:** Axios

### AI & Generation Engine
- **LLM Integration:** Google Gemini API (Configurable)
- **Fallback Engine:** Rule-based dynamic code generator for offline execution

---

## 📁 Project Structure

```text
SwarmOS/
├── backend/
│   ├── config/             # DB & server configuration
│   ├── controllers/        # Express route controllers
│   ├── models/             # Mongoose schemas (Project, Task, ProjectFile, Message)
│   ├── routes/             # API endpoints (/api/projects, /api/chat, /api/auth)
│   ├── services/           # Business logic (agentService, orchestratorService, runnerService)
│   ├── server.js           # Express application entry point
│   └── .env.example        # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/     # UI components & ErrorBoundary
│   │   ├── context/        # Auth Context Provider
│   │   ├── pages/          # Dashboard, Workspace, Projects, WhatsAppPage
│   │   ├── services/       # Frontend API client services
│   │   └── App.tsx         # Main route tree
│   ├── index.html
│   └── package.json
├── .env.example            # Root environment variable template
├── .gitignore              # Git exclusion safety rules
└── README.md               # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** A running local MongoDB instance or MongoDB Atlas Connection String

### Step-by-Step Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Pooja-1109/SwarmOS-.git
   cd SwarmOS-
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables:**
   Create a `.env` file inside `backend/` by copying `backend/.env.example`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Fill in your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/swarmos?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_dev_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 🏃 Running Locally

Launch the backend and frontend development servers in separate terminal windows:

### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
```
*Backend API will run on `http://localhost:5000`*

### Terminal 2: Start Frontend Application
```bash
cd frontend
npm run dev
```
*Frontend interface will open on `http://localhost:5173`*

---

## 🎬 Recommended Hackathon Demo Walkthrough

Follow this sequence to test SwarmOS during evaluation:

1. **Register & Log In:** Open `http://localhost:5173` and register a new user account.
2. **Create Project:** Click `+ Create Project`, enter:
   - **Title:** `Library Management System`
   - **Requirement:** `Build a library management system with books, members, issue and return, overdue tracking and reports.`
3. **Watch AI Swarm:** Click **[ Start AI Team ]**. Observe the 7 AI agents transition from *Running* to *Completed* as the real-time activity feed streams events.
4. **Inspect Source Files:** Open the `Files` tab to review the generated `index.html`, `styles.css`, `app.js`, `PRD.md`, and `QA_REPORT.md`.
5. **Run the Generated Application:** Click **[ ▶ Run Project ]**. Click **Open Running Project** to open the live software running at `http://localhost:5000/runtime/<projectId>/`.
6. **Refine via Conversational Chat:** Open **SwarmOS Assistant** (Chat), type:
   - *"Add admin login and dark mode"*
   - Watch SwarmOS update requirements, regenerate source files, and update the live runtime!
7. **Download ZIP:** Click **Download ZIP** to receive the complete project source code archive.

---

## 📊 Current MVP Status

| Feature / Module | Implementation Status | Description |
| :--- | :--- | :--- |
| **Authentication & Auth Context** | ✅ **Implemented** | JWT registration, login, protected routes |
| **Project Creation & Persistence** | ✅ **Implemented** | Save projects, tasks, and files to MongoDB |
| **Multi-Agent Orchestration** | ✅ **Implemented** | 7 specialized agent roles with task execution graphs |
| **Artifact & Code Generation** | ✅ **Implemented** | Full-stack HTML/CSS/JS + PRD + Test generation |
| **Generated Project Runtime** | ✅ **Implemented** | Served dynamic apps at `http://localhost:5000/runtime/:id/` |
| **ZIP Export Engine** | ✅ **Implemented** | Binary `.zip` download with custom filename slugs |
| **Conversational Project Assistant**| ✅ **Implemented** | Natural chat interface with persistent message history |
| **Knowledge Base Foundation** | 🟡 **Foundation** | File metadata indexing implemented; vector RAG planned |
| **Meta WhatsApp API Channel** | 🟡 **Architecture** | Webhook parser & adapter ready; requires Meta credentials |
| **Cloud Deployment Engine** | 🟡 **Config Dependent**| Local runtime ready; Vercel/Netlify requires API tokens |

---

## 🔮 Future Scope

- **Vector Database Integration:** Full Pinecone/Qdrant integration for semantic RAG document search.
- **GitHub Integration:** One-click repository creation and automated `git push` to user GitHub accounts.
- **Live WhatsApp Webhook Deployment:** Out-of-the-box Meta WhatsApp Cloud API sandbox integration.
- **Containerized Sandboxing:** Docker/Kubernetes container execution for multi-file Node/React builds.
- **Voice Agent Commands:** Voice-to-text project refinement commands.

---

## 🔒 Security & Environmental Safety

- `.env` and sensitive environment variable files are strictly ignored via `.gitignore` to prevent credential leaks.
- All backend routes require valid JWT Authorization headers.
- Project runtime files are safely scoped within project-specific directories with path traversal safeguards.

---

<p center>
Built with ❤️ for the Hackathon by <strong>Team SwarmOS</strong>
</p>
