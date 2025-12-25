# 📋 Projeto: Universal Spec CLI (Agents.Dev Installer)

Objetivo: Ferramenta CLI (Node.js) que configura automaticamente o ambiente de desenvolvimento e instala agentes de IA (Auditor, Coder, etc.) para diversas ferramentas (Gemini CLI, Roo Code, Cline).

## Stack Tecnológica
*   **Linguagem:** Node.js (JavaScript)
*   **Interface (TUI):** `@clack/prompts`
*   **Parsing:** `js-yaml`
*   **Distribuição:** NPM Registry (`npx agents-dev`)

## Arquitetura de Pastas
```
/universal-spec
├── /src
│   └── index.js          # Lógica principal e Interface
├── /definitions          # Arquivos YAML com a definição dos Agentes
│   ├── dev.coder.yaml
│   ├── dev.auditor.yaml
│   └── ...
├── package.json
└── README.md
```

## Funcionalidades
### 1. Instalação de Agentes de IA
Lê definições agnósticas (YAML) e converte para formatos específicos:
*   **Gemini CLI:** Gera `.gemini/commands/dev/*.toml`.
*   **Roo Code / Cline:** Gera `*_custom_modes.json` (Custom Modes).
*   **Kilo Code:** Gera `.kilo/prompts/*.md`.

### 2. Configuração de Ambiente (Roadmap)
*   VS Code (Settings & Tasks).
*   Shell Aliases.
*   Git Hooks.

## Fluxo de Uso
1.  Usuário roda: `npx agents-dev` (ou `npm init agents-dev`).
2.  Interface interativa pergunta:
    *   "O que configurar?" (Agentes, VS Code, etc.)
    *   "Qual ferramenta de IA você usa?"
3.  CLI gera os arquivos de configuração na pasta atual.
