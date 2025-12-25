# agents-dev (Universal Spec CLI)

Ferramenta CLI para configurar automaticamente o ambiente de desenvolvimento e instalar agentes de IA (Auditor, Coder, etc.) para diversas ferramentas como Gemini CLI, Roo Code, Cline e Kilo Code.

## Funcionalidades

### 1. Instalação de Agentes de IA
Lê definições agnósticas (YAML) e converte para formatos específicos:
*   **Gemini CLI:** Gera arquivos de configuração `.toml`.
*   **Roo Code / Cline:** Gera modos customizados (`_custom_modes.json`).
*   **Kilo Code:** Gera prompts em Markdown (`.kilo/prompts/*.md`).

### 2. Configuração
Automatiza a criação de arquivos de configuração necessários para integrar agentes de IA ao seu fluxo de trabalho.

## Instalação e Uso

Você pode executar a ferramenta diretamente via `npx` sem instalação prévia:

```bash
npx agents-dev
```

Ou instalar globalmente:

```bash
npm install -g agents-dev
agents-dev
```

## Como funciona

1.  Execute `npx agents-dev` na raiz do seu projeto.
2.  A interface interativa perguntará quais configurações você deseja aplicar.
3.  Os arquivos de configuração dos agentes serão gerados na pasta do seu projeto.

## Estrutura do Projeto

*   `src/`: Código fonte da CLI.
*   `definitions/`: Definições YAML dos agentes (agnósticas).

## Licença

MIT
