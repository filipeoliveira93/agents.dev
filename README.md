# 🤖 Agents.dev

**The "Package Manager" for AI Agents.**
Agents.dev is a CLI tool that defines a standard Squad of AI Developers and installs them directly into your favorite AI Coding Assistant contexts (Gemini, Roo Code, Kilo Code, OpenCode).

Stop prompting from scratch. Install a proven workflow.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An AI Coding Assistant (e.g., Google IDX with Gemini, VSCode with Roo Code)

### Installation & Usage

**Option 1: Direct Install (Recommended)**
Install globally or in your project:
```bash
npx agents.dev
# OR
npm install agents.dev
agents-install
```

**Option 2: From Source**
1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/agents.dev.git
   cd agents.dev
   ```
2. Install & Run:
   ```bash
   npm install
   npm start
   ```

### First Run
Running the tool will start the **Wizard**:
1.  **Select OS**: Windows or Unix.
2.  **Select Targets**: Choose formats to build (Gemini, Roo, etc.).
3.  **Docs Auto-Gen**: It automatically creates `docs/` and a workflow guide.

---

## 👥 The Squad (Agent Functions)

The system works best when you follow this pipeline. Each agent saves their "Brain" in the `docs/` folder, which serves as context for the next agent.

### 🏗️ 1. Project Architect
**"The Visionary"**  
Transforms your raw idea into a professional specification. It acts as an interviewer to discover hidden requirements.
- **Trigger:** `/dev.project "I want a Uber clone for dog walking"`
- **Action:** Asks clarifying questions about features, target audience, and constraints.
- **Output:** `docs/project.md` (Scope, User Stories, Core Principles).

### 🧱 2. Requirements Engineer
**"The Tech Lead"**  
Decides *how* to build it. Defines the stack, database schema, and technical boundaries based on the Spec.
- **Trigger:** `/dev.requirements`
- **Action:** Selects libraries (e.g., "Prisma vs TypeORM"), defines API contracts, and security rules.
- **Output:** `docs/requirements.md` (The "Technical Contract" that the Coder must obey).

### 🗺️ 3. Milestone Manager
**"The Strategist"**  
Prevents you from trying to build everything at once. Slices the project into logical "MVPs" (Phases).
- **Trigger:** `/dev.milestone`
- **Output:** `docs/milestones.md` (e.g., Phase 1: Auth, Phase 2: Payment, Phase 3: GPS).

### 📋 4. Task Planner
**"The Project Manager"**  
Takes **ONE Milestone** and breaks it down into atomic, bite-sized tasks for the AI Coder.
- **Reasoning:** AI Coders hallucinate less when the context is small.
- **Trigger:** `/dev.tasks 1` (Plan Milestone 1)
- **Output:** `docs/task.md` (A checklist of 5-10 specific file operations).

### 🕵️ 5. Auditor
**"The Gatekeeper"**  
A safety check before you start coding. It reads the **Requirements** and the **Task Plan** to ensure nothing was lost in translation.
- **Trigger:** `/dev.auditor`
- **Action:** "Hey, you planned the Login UI but forgot the 'Forgot Password' flow mentioned in Requirements."
- **Output:** `audit_report.md` (Pass/Fail).

### 💻 6. Coder
**"The Senior Developer"**  
The workhorse. It executes ONE task from the checklist at a time.
- **Features:**
    - **Context Aware:** Reads `project.md` to know "Project Principles" (e.g., "Use Functional Components").
    - **Safety:** Checks `.gitignore` before creating files.
    - **TDD:** Can write tests before code if requested.
- **Trigger:** `/dev.coder 1.1` (Implement Task 1.1)
- **Output:** Writes code to `src/` and logs to `work_log.md`.

### ⚖️ 7. QA Engineer
**"The Reviewer"**  
Simulates a Pull Request review. It checks if the code matches the Requirements contracts.
- **Trigger:** `/dev.review 1.1`
- **Action:** Reads the code and the `requirements.md`. If variables are named poorly or logic is insecure, it REJECTS the task.

### 📦 8. Release Manager
**"The Historian"**  
Consolidates the messy daily `work_log.md` into a clean `CHANGELOG`.
- **Trigger:** `/dev.log`

---

## 🛠️ On-Demand Toolkit

### 🏗️ DevOps Engineer (`/dev.ops`)
**"The Config Specialist"**  
Don't waste token context on config files during feature dev. Call this agent specifically for:
- "Create a Dockerfile for this Node structure"
- "Setup Github Actions for tests"
- "Configure ESLint and Prettier"

---

## 🎯 Supported Targets

- **Gemini CLI** (`.gemini/commands/*.toml`)
- **Roo Code** (`.roo/commands/*.md`)
- **Kilo Code** (`.kilocode/workflows/*.md`)
- **OpenCode** (`.opencode/command/*.md`)

## 📄 Documentation
During installation, the CLI automatically generates a `docs/README.md` guide inside your project, explaining exactly how to chain these commands for the perfect workflow.
