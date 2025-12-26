# agents.dev (Universal Spec CLI)

Ferramenta CLI para configurar automaticamente o ambiente de desenvolvimento e instalar agentes de IA (Auditor, Coder, etc.) para diversas ferramentas modernas de IA.

## Funcionalidades

### 1. Instalação de Agentes de IA
Lê definições agnósticas (YAML) e converte para formatos específicos:
*   **Gemini CLI:** Gera arquivos de configuração `.toml`.
*   **Roo Code / Cline:** Gera modos customizados (`_custom_modes.json`) e regras de contexto em `.roo/` ou `.cline/`.
*   **GitHub Copilot:** Gera instruções em `.github/copilot-instructions.md` e agentes em `.github/agents/`.
*   **Cursor:** Gera regras em `.cursor/rules/*.mdc`.
*   **Windsurf:** Gera regras em `.windsurfrules`.
*   **Trae:** Gera instruções em `.trae/instructions.md`.
*   **OpenCode:** Gera agentes em `.opencode/`.
*   **OpenAI / Claude (Web):** Gera prompts em texto puro na pasta `prompts/`.
*   **Kilo Code:** Gera prompts em Markdown (`.kilo/prompts/*.md`).

### 2. Configuração de Workflow
Automatiza a criação da estrutura de documentação (`docs/` e `docs/logs/`) para suportar o fluxo de trabalho dos agentes.

## Instalação e Uso

Você pode executar a ferramenta diretamente via `npx` sem instalação prévia:

```bash
npx agents.dev
```

Ou instalar globalmente:

```bash
npm install -g agents.dev
agents.dev
```

## Como funciona

1.  Execute `npx agents.dev` na raiz do seu projeto.
2.  A interface interativa perguntará quais configurações você deseja aplicar e para qual ferramenta.
3.  Os arquivos de configuração dos agentes serão gerados na pasta do seu projeto automaticamente.

## Estrutura do Projeto

*   `src/`: Código fonte da CLI.
*   `definitions/`: Definições YAML dos agentes (agnósticas).

## Licença

MIT
