const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

/**
 * Gera o guia de workflow do projeto
 */
function generateWorkflowGuide(baseDir) {
    const docsDir = path.join(baseDir, 'docs');
    
    // Conteúdo baseado no exemplo provided
    const content = `# 🤖 Agent Workflow Guide

Este documento descreve o fluxo de desenvolvimento padrão usando os Agentes instalados.
O sistema segue um processo **Waterfall** para planejamento (precisão) e **Iterativo** para execução.

---

## 1. 🏗️ Project Spec (@Project Architect)
**Role:** O Visionário.
**Goal:** Traduzir sua ideia vaga em uma Especificação concreta com "Project Principles" definidos.
- **Comando:** \
/dev:project "Eu quero um App de Todo que..."
- **Saída:** 
`docs/project.md`

## 2. 🧱 Requirements Engineering (@Requirements Engineer)
**Role:** O Tech Lead.
**Goal:** Fechar decisões técnicas (Stack, Banco de Dados, Libs).
- **Why?** Evita que o Coder "invente" arquitetura. Cria o "Contrato".
- **Comando:** 
/dev:requirements
- **Saída:** 
`docs/requirements.md`

## 3. 🗺️ Roadmap Strategy (@Milestone Manager)
**Role:** O Estrategista.
**Goal:** Fatiar o projeto em fases de entrega (MVPs).
- **Comando:** 
/dev:milestone
- **Saída:** 
`docs/milestones.md`

## 4. 📋 Task Planning (@Task Planner)
**Role:** O Gerente.
**Goal:** Quebrar um Milestone específico em tarefas atômicas para desenvolvedores.
- **Why?** IAs falham com contextos gigantes. Tarefas pequenas = Código perfeito.
- **Comando:** 
/dev:tasks <Milestone_ID>
- **Saída:** 
`docs/task.md`

## 5. 🕵️ Blueprint Audit (@Auditor)
**Role:** O Guardião.
**Goal:** Validar consistência entre **Requirements** e **Tasks**.
- **Comando:** 
/dev:auditor
- **Saída:** 
`audit_report.md`

## 6. 💻 Implementation (@Coder)
**Role:** O Construtor.
**Goal:** Executar *uma tarefa por vez* do arquivo 
`task.md`.
- **Comando:** 
/dev:coder <Task_ID>
- **Buffer:** 
`work_log.md`

## 7. ⚖️ Quality Assurance (@QA Engineer)
**Role:** O Inspetor.
**Goal:** Verificar se a implementação bate com os Requisitos.
- **Comando:** 
/dev:review <Task_ID>
- **Saída:** 
`docs/logs/review_log.md`

## 8. 📦 Release Management (@Release Manager)
**Role:** O Historiador.
**Goal:** Consolidar o 
`work_log.md` em um 
`changelog.md` permanente.
- **Comando:** 
/dev:log
- **Saída:** 
`changelog.md`
`;

    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
        fs.writeFileSync(path.join(docsDir, 'README.md'), content);
        return true;
    }
    return false;
}

module.exports = { generateWorkflowGuide };
