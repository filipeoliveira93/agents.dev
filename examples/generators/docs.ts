import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function generateWorkflowGuide(docsDir: string, shell: string): Promise<void> {
  const readmeContent = `# 🤖 Agent Workflow Guide

This document outlines the standard development flow using the installed Agents.
The system follows a **Waterfall-like** process relative to planning (to ensure precision) and an **Iterative** process for execution.

---

## 1. 🏗️ Project Spec (@Project Architect)
**Role:** The Visionary.
**Goal:** Translate your vague idea into a concrete Specification with defined "Project Principles" (Constitution).
- **Why?** To ensure the machine understands the "Soul" of the project (e.g., "Mobile First", "Minimalist").
- **Command:** \`/dev:project "I want a Todo App that..."\`
- **Output:** \`docs/project.md\`

## 2. 🧱 Requirements Engineering (@Requirements Engineer)
**Role:** The Tech Lead.
**Goal:** Lock down technical decisions (Stack, Database, Libraries) based on the Spec.
- **Why?** To prevent the Coder from "inventing" architecture on the fly. It creates a "Contract" of what to build.
- **Command:** \`/dev:requirements\`
- **Output:** \`docs/requirements.md\` (The Technical Contract)

## 3. 🗺️ Roadmap Strategy (@Milestone Manager)
**Role:** The Strategist.
**Goal:** Slice the project into logical delivery phases (MVPs).
- **Why?** To avoid "Big Bang" development. It organizes work into sequential milestones (e.g., "M1: Auth", "M2: Dashboard").
- **Command:** \`/dev:milestone\`
- **Output:** \`docs/milestones.md\`

## 4. 📋 Task Planning (@Task Planner)
**Role:** The Manager.
**Goal:** Break down a specific Milestone into atomic, developer-ready tasks.
- **Why?** AI coders fail with large contexts. Small, clear tasks = Perfect code.
- **Command:** \`/dev:tasks <Milestone_ID>\`
- **Output:** \`docs/task.md\`

## 5. 🕵️ Blueprint Audit (@Auditor)
**Role:** The Gatekeeper.
**Goal:** Validate consistency between **Requirements** (The Contract) and **Tasks** (The Plan).
- **Why?** To catch missing requirements or dangerous hallucinations *before* a single line of code is written.
- **Command:** \`/dev:auditor\`
- **Output:** \`audit_report.md\`

## 6. 💻 Implementation (@Coder)
**Role:** The Builder.
**Goal:** Execute *one task at a time* from the \`task.md\` file.
- **Why?** Focus. It reads the docs, writes the code (and tests), and logs progress.
- **Safeguards:** Checks for \`.gitignore\` and strictly follows \`requirements.md\`.
- **Command:** \`/dev:coder <Task_ID>\`
- **Buffer:** \`work_log.md\`

## 7. ⚖️ Quality Assurance (@QA Engineer)
**Role:** The Inspector.
**Goal:** Verify if the implementation matches the Requirement Artifacts.
- **Why?** Trust but verify. It reads the \`work_log.md\` and checks against expectations.
- **Command:** \`/dev:review <Task_ID>\`
- **Output:** \`docs/logs/review_log.md\`

## 8. 📦 Release Management (@Release Manager)
**Role:** The Historian.
**Goal:** Consolidate the temporary \`work_log.md\` into a permanent \`changelog.md\`.
- **Why?** To clean up the workspace and keep a professional history of the project.
- **Command:** \`/dev:log\`
- **Output:** \`changelog.md\`

---

## 🛠️ On-Demand Utilities

### Infrastructure (@DevOps Engineer)
**Role:** The Mechanic.
**Goal:** Handle "Config Hell" (Docker, CI/CD, Linters).
- **Why?** Keeps the Coder focused on business logic.
- **Command:** \`/dev:ops\`
`;

  await fs.ensureDir(docsDir);
  await fs.writeFile(path.join(docsDir, 'README.md'), readmeContent);
  console.log(chalk.green(`✅ Created "docs/" directory (Optimized for ${shell}).\n`));
  console.log(chalk.green(`   -> Generated "docs/README.md" with workflow instructions.\n`));
}
