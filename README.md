# Agents.dev

**Agents.dev** is a CLI tool that acts as a "Source of Truth" for your AI Development Agents.
Inspired by tools like *Specify*, it allows you to define your agent personas in a single, agnostic YAML format and "compile" them into configuration files for various AI coding assistants.

## 🚀 Supported Targets

The CLI currently installs agents directly into the configuration paths for:

- **Gemini CLI**: `.gemini/commands/dev/`
- **Roo Code**: `.roo/commands/`
- **Kilo Code**: `.kilocode/workflows/`
- **OpenCode**: `.opencode/command/`

## 📦 Installation

This project is designed to be run as a dev dependency or a local tool within your repository.

```bash
npm install
```

## 🛠️ Usage

### 1. Define your Agents
Create YAML files in the `definitions/` directory.

**Example:** `definitions/backend-architect.yaml`
```yaml
name: Backend Architect
role: Senior Backend Engineer
emoji: 🏗️
systemPrompt: |
  You are a Senior Backend Engineer.
  You specialize in Scalable Node.js APIs.
rules:
  - Always write unit tests.
  - Use snake_case for database columns.
```

### 2. Build/Install
Run the start command to convert your YAMLs into target configurations.

**Interactive Mode:**
```bash
npm start
```
*Select which targets you want to update using the interactive menu.*

**CLI Mode (CI/CD friendly):**
```bash
npm start -- --target gemini,roo
```

## ✅ Validation
The CLI includes Zod validation to ensure your definitions are complete.
Required fields:
- `name`
- `role`
- `systemPrompt` (min 10 characters)

## 📂 Project Structure
```text
.
├── definitions/       # Your Source of Truth (YAML)
├── src/               # CLI Source Code
├── .gemini/           # Generated Gemini Commands
├── .roo/              # Generated Roo Contexts
├── .kilocode/         # Generated Kilo Workflows
└── .opencode/         # Generated OpenCode Commands
```
