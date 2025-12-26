# agents-dev (Universal Spec CLI)

Ferramenta CLI para configurar automaticamente o ambiente de desenvolvimento e instalar agentes de IA (Auditor, Coder, etc.) para diversas ferramentas modernas de IA.

## Visão Geral

**Agents-dev** é um "Gerenciador de Pacotes para Agentes de IA". Ele define um esquadrão padrão de Desenvolvedores de IA e os instala diretamente no contexto do seu Assistente de Codificação de IA favorito (como Gemini, Roo Code, Kilo Code, OpenCode).

A ideia principal é parar de criar prompts do zero e instalar um fluxo de trabalho comprovado e estruturado.

## Funcionalidades Principais

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

## 👥 O Esquadrão (Funções dos Agentes)

O sistema funciona melhor quando você segue o pipeline definido. Cada agente salva seu "Cérebro" (contexto) na pasta `docs/`, que serve de base para o próximo agente na cadeia.

### 🏗️ 1. Project Architect (Arquiteto de Projeto)
**"O Visionário"**
Transforma sua ideia bruta em uma especificação profissional. Ele atua como um entrevistador para descobrir requisitos ocultos.
- **Gatilho:** `/dev.project "Eu quero um clone do Uber para passear com cachorros"`
- **Ação:** Faz perguntas esclarecedoras sobre recursos, público-alvo e restrições.
- **Saída:** `docs/project.md` (Escopo, Histórias de Usuário, Princípios Fundamentais).

### 🧱 2. Requirements Engineer (Engenheiro de Requisitos)
**"O Líder Técnico"**
Decide *como* construir. Define a pilha tecnológica (stack), esquema do banco de dados e limites técnicos com base na especificação.
- **Gatilho:** `/dev.requirements`
- **Ação:** Seleciona bibliotecas (ex: "Prisma vs TypeORM"), define contratos de API e regras de segurança.
- **Saída:** `docs/requirements.md` (O "Contrato Técnico" que o Codificador deve obedecer).

### 🗺️ 3. Milestone Manager (Gerente de Marcos)
**"O Estrategista"**
Impede que você tente construir tudo de uma vez. Divide o projeto em "MVPs" lógicos (Fases).
- **Gatilho:** `/dev.milestone`
- **Saída:** `docs/milestones.md` (ex: Fase 1: Auth, Fase 2: Pagamento, Fase 3: GPS).

### 📋 4. Task Planner (Planejador de Tarefas)
**"O Gerente de Projeto"**
Pega **UM Marco** e o quebra em tarefas atômicas e pequenas para o Codificador de IA.
- **Raciocínio:** Codificadores de IA alucinam menos quando o contexto é pequeno.
- **Gatilho:** `/dev.tasks 1` (Planejar Marco 1)
- **Saída:** `docs/task.md` (Uma lista de verificação de 5-10 operações de arquivo específicas).

### 🕵️ 5. Auditor
**"O Guardião"**
Uma verificação de segurança antes de começar a codificar. Ele lê os **Requisitos** e o **Plano de Tarefas** para garantir que nada se perdeu na tradução.
- **Gatilho:** `/dev.auditor`
- **Ação:** "Ei, você planejou a UI de Login, mas esqueceu o fluxo de 'Esqueci a Senha' mencionado nos Requisitos."
- **Saída:** `audit_report.md` (Aprovado/Reprovado).

### 💻 6. Coder (Codificador)
**"O Desenvolvedor Sênior"**
O executor. Ele executa UMA tarefa da lista de verificação por vez.
- **Funcionalidades:**
    - **Consciente do Contexto:** Lê `project.md` para conhecer os "Princípios do Projeto" (ex: "Use Componentes Funcionais").
    - **Segurança:** Verifica `.gitignore` antes de criar arquivos.
    - **TDD:** Pode escrever testes antes do código, se solicitado.
- **Gatilho:** `/dev.coder 1.1` (Implementar Tarefa 1.1)
- **Saída:** Escreve código em `src/` e registra em `work_log.md`.

### ⚖️ 7. QA Engineer (Engenheiro de QA)
**"O Revisor"**
Simula uma revisão de Pull Request. Verifica se o código corresponde aos contratos de Requisitos.
- **Gatilho:** `/dev.review 1.1`
- **Ação:** Lê o código e o `requirements.md`. Se variáveis forem mal nomeadas ou a lógica for insegura, ele REJEITA a tarefa.

### 📦 8. Release Manager (Gerente de Lançamento)
**"O Historiador"**
Consolida o `work_log.md` diário bagunçado em um `CHANGELOG` limpo.
- **Gatilho:** `/dev.log`

## 🛠️ Toolkit Sob Demanda

### 🏗️ DevOps Engineer
**"O Especialista em Configuração"**
Chame este agente especificamente para tarefas de infraestrutura, para não gastar contexto do agente principal.
- **Gatilho:** `/dev.ops`
- **Exemplos:** "Criar Dockerfile", "Configurar Github Actions", "Configurar ESLint".

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

## Como funciona a CLI

Quando você executa `npx agents-dev`, o assistente de instalação é iniciado:

1.  **Inicialização:** O assistente pergunta qual terminal (shell) você usa (Windows ou Unix) e gera um guia de fluxo de trabalho personalizado na pasta `docs/`.
2.  **Construção dos Agentes:** O assistente lê as definições dos agentes (seja da pasta `definitions/` ou de um arquivo `agents.md` local) e os "compila" para o formato do seu assistente de IA escolhido.
3.  **Destinos Suportados:**
    -   **Gemini CLI:** Gera arquivos `.toml` em `.gemini/commands/`.
    -   **Roo Code / Cline:** Gera modos customizados (`_custom_modes.json`) e regras em `.roo/` ou `.cline/`.
    -   **GitHub Copilot:** Gera instruções em `.github/copilot-instructions.md` e agentes em `.github/agents/`.
    -   **Kilo Code:** Gera fluxos de trabalho em `.kilocode/workflows/`.
    -   **OpenCode:** Gera arquivos em `.opencode/command/`.
    -   **Outros:** Suporte a Cursor, Windsurf, Trae, OpenAI/Claude Web.

Dessa forma, o **Agents-dev** atua como uma ponte entre definições de comportamento de agentes e a ferramenta que você usa para codificar, garantindo que seu "time" de IA esteja sempre configurado e pronto para trabalhar.

## Estrutura do Projeto

*   `src/`: Código fonte da CLI.
*   `definitions/`: Definições YAML dos agentes (agnósticas).

## Licença

MIT