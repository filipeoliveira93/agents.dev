# Work Log - Universal Spec CLI

## [2025-12-19] - Fundação do Projeto

### 1. Inicialização do Ambiente
- **Ação:** Executado `go mod init universal-spec`.
- **Motivo:** Definir o módulo base do projeto Go para gerenciamento de dependências.

### 2. Estrutura de Diretórios
- **Ação:** Criação das pastas `cmd`, `internal/core`, `internal/ui`, `internal/adapters`, `npm` e `examples`.
- **Motivo:** Organização seguindo as melhores práticas de Clean Architecture para projetos CLI em Go.

### 3. Gerenciamento de Dependências
- **Ação:** Instalação das bibliotecas `cobra`, `viper`, `bubbletea` e `lipgloss`.
- **Motivo:** 
    - `cobra`: Framework para comandos CLI.
    - `viper`: Gerenciamento de configurações (YAML).
    - `bubbletea` & `lipgloss`: Criação da interface interativa (TUI).

### 4. Ponto de Entrada (Main)
- **Ação:** Criado `cmd/main.go`.
- **Motivo:** Arquivo principal que delega a execução para o pacote de comandos `spec`.

### 5. Comando Raiz do CLI
- **Ação:** Criado `cmd/spec/root.go`.
- **Motivo:** Configuração do comando base `spec` e do subcomando `version` usando o framework Cobra.

### 6. Lógica de Configuração (Core)
- **Ação:** Criado `internal/core/config.go` com structs e função `LoadConfig`.
- **Motivo:** Implementar o parsing do arquivo `spec.yaml` usando Viper e mapeá-lo para structs Go tipadas.

### 7. Comando Init (Draft)
- **Ação:** Criado `cmd/spec/init.go`.
- **Motivo:** Implementação inicial do comando `init` que carrega a configuração e valida o arquivo `spec.yaml`. Conclui a Fase 1.

### 8. Interface Interativa (TUI)
- **Ação:** Implementado `internal/ui/initial_model.go` e atualizado `cmd/spec/init.go`.
- **Motivo:** Criação de um menu de seleção interativo (Checklist) usando `bubbletea`, permitindo ao usuário escolher quais componentes instalar (VS Code, Shell, Git) diretamente no terminal. Conclui a Fase 2.

### 9. Pivot para Node.js Puro
- **Ação:**
    - Removido todo o código Go (`cmd`, `internal`, `go.mod`).
    - Inicializado projeto Node.js (`package.json`, `npm install`).
    - Criado `src/index.js` usando `@clack/prompts` para UI e `js-yaml` para parsing.
    - Implementada lógica de instalação de agentes lendo de `definitions/` e gerando TOML.
- **Motivo:** Simplificar drasticamente a distribuição e manutenção. Agora o projeto é um pacote NPM padrão, sem necessidade de compilação de binários ou scripts de post-install complexos. O usuário final roda `npx agents-dev` e funciona.

### 10. Suporte Multi-Ferramenta
- **Ação:** Atualizado `src/index.js` para suportar:
    - **Roo Code / Cline:** Gera arquivos JSON (`*_custom_modes.json`) compatíveis com a configuração de "Custom Modes" destas extensões.
    - **Kilo Code:** Gera arquivos `.md` na pasta `.kilo/prompts`.
    - **Gemini CLI:** Mantido suporte a `.toml`.
- **Motivo:** Flexibilidade para o usuário escolher sua ferramenta de IA preferida e ter os agentes (`Coder`, `Auditor`, etc.) configurados automaticamente no formato correto.

### 11. Refatoração Modular e Validação (Clean Code)
- **Ação:**
    - Extraída lógica de validação para `src/lib/schema.js` usando `zod`.
    - Extraída lógica de conversão para `src/lib/transformers.js`.
    - Criado `src/lib/docs.js` para gerar documentação automática (`docs/README.md`) explicando o fluxo de trabalho dos agentes.
    - Simplificado `src/index.js` para atuar apenas como orquestrador da UI.
- **Motivo:** Melhorar a manutenibilidade, robustez (validando os YAMLs antes de processar) e experiência do usuário (entregando documentação de uso junto com os agentes).
