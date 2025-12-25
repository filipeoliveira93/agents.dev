#!/usr/bin/env node

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { intro, outro, multiselect, select, spinner, note } = require('@clack/prompts');
const pc = require('picocolors');

// Módulos Internos
const { loadAgents } = require('./lib/agents');
const { 
    toGeminiTOML, 
    toRooConfig, 
    toKiloMarkdown, 
    toCopilotInstructions,
    toCursorMDC,
    toWindsurfRules
} = require('./lib/transformers');
const { generateWorkflowGuide } = require('./lib/docs');

async function main() {
    console.clear();
    intro(pc.bgMagenta(pc.white(' UNIVERSAL SPEC CLI ')));

    // 1. Seleção de Componentes
    const components = await multiselect({
        message: 'O que você deseja configurar?',
        options: [
            { value: 'docs', label: 'Gerar Documentação de Workflow (docs/README.md)', hint: 'Essencial' },
            { value: 'agents', label: 'Instalar Agentes de IA', hint: 'Recomendado' },
        ],
        required: true,
    });

    if (!components) {
        outro('Operação cancelada.');
        process.exit(0);
    }

    // 2. Instalação de Documentação
    if (components.includes('docs')) {
        const created = generateWorkflowGuide(process.cwd());
        if (created) {
            note('Documentação criada em docs/README.md', 'Docs');
        } else {
            console.log(pc.gray('ℹ️  Pasta docs/ já existe. Ignorando criação.'));
        }
    }

    // 3. Instalação de Agentes
    if (components.includes('agents')) {
        const tool = await select({
            message: 'Onde você deseja instalar os Agentes?',
            options: [
                { value: 'gemini', label: 'Gemini CLI', hint: '.gemini/commands/dev' },
                { value: 'roo', label: 'Roo Code', hint: '.roo/ & custom_modes.json' },
                { value: 'cline', label: 'Cline', hint: '.cline/ & custom_modes.json' },
                { value: 'cursor', label: 'Cursor', hint: '.cursor/rules/*.mdc' },
                { value: 'windsurf', label: 'Windsurf', hint: '.windsurfrules' },
                { value: 'kilo', label: 'Kilo Code', hint: '.kilo/prompts/*.md' },
                { value: 'copilot', label: 'GitHub Copilot', hint: '.github/copilot-instructions.md' },
            ],
        });

        if (!tool) process.exit(0);

        await processAgentsInstallation(tool);
    }

    outro(pc.green('Configuração concluída com sucesso! 🚀'));
}

async function processAgentsInstallation(tool) {
    const s = spinner();
    s.start('Carregando definições...');

    try {
        const validAgents = await loadAgents();

        if (validAgents.length === 0) {
            s.stop('Nenhum agente válido encontrado.');
            return;
        }

        s.message(`Instalando ${validAgents.length} agentes para ${tool}...`);

        // Instalação Específica por Ferramenta
        if (tool === 'gemini') {
            const targetDir = path.join(process.cwd(), '.gemini', 'commands', 'dev');
            await fsp.mkdir(targetDir, { recursive: true });

            await Promise.all(validAgents.map(agent => {
                const toml = toGeminiTOML(agent);
                // Usa originalName para manter pontos (dev.coder.toml)
                const fileName = `${agent.originalName}.toml`; 
                return fsp.writeFile(path.join(targetDir, fileName), toml);
            }));
        } 
        else if (tool === 'roo' || tool === 'cline') {
            const configDir = tool === 'roo' ? '.roo' : '.cline';
            const targetDir = path.join(process.cwd(), configDir);
            await fsp.mkdir(targetDir, { recursive: true });

            // 1. Gera arquivos Markdown (Contexto)
            await Promise.all(validAgents.map(agent => {
                const md = toKiloMarkdown(agent);
                return fsp.writeFile(path.join(targetDir, `${agent.slug}.md`), md);
            }));

            // 2. Gera JSON para Custom Modes
            const modes = validAgents.map(agent => toRooConfig(agent, agent.slug));
            const jsonContent = JSON.stringify({ customModes: modes }, null, 2);
            const fileName = `${tool}_custom_modes.json`;
            await fsp.writeFile(path.join(process.cwd(), fileName), jsonContent);
            
            note(`1. Arquivos de contexto salvos em '${configDir}/'\n2. Copie o conteúdo de '${fileName}' para configurar os modos na extensão.`, 'Configuração Híbrida');
        } 
        else if (tool === 'kilo') {
            const targetDir = path.join(process.cwd(), '.kilo', 'prompts');
            await fsp.mkdir(targetDir, { recursive: true });

            await Promise.all(validAgents.map(agent => {
                const md = toKiloMarkdown(agent);
                return fsp.writeFile(path.join(targetDir, `${agent.slug}.md`), md);
            }));
        }
        else if (tool === 'copilot') {
            const githubDir = path.join(process.cwd(), '.github');
            const agentsDir = path.join(githubDir, 'agents');
            await fsp.mkdir(agentsDir, { recursive: true });

            await Promise.all(validAgents.map(agent => {
                const md = toCopilotInstructions(agent);
                return fsp.writeFile(path.join(agentsDir, `${agent.slug}.md`), md);
            }));

            const mainAgent = validAgents.find(a => a.slug.includes('coder')) || validAgents[0];
            const mainInstructions = toCopilotInstructions(mainAgent);
            await fsp.writeFile(path.join(githubDir, 'copilot-instructions.md'), mainInstructions);
            note(`Agente principal (${mainAgent.name}) definido em .github/copilot-instructions.md`, 'Configuração Copilot');
        }
        else if (tool === 'cursor') {
            const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
            await fsp.mkdir(rulesDir, { recursive: true });

            await Promise.all(validAgents.map(agent => {
                const mdc = toCursorMDC(agent);
                return fsp.writeFile(path.join(rulesDir, `${agent.slug}.mdc`), mdc);
            }));
            note(`Regras salvas em .cursor/rules/*.mdc`, 'Configuração Cursor');
        }
        else if (tool === 'windsurf') {
            const mainAgent = validAgents.find(a => a.slug.includes('coder')) || validAgents[0];
            const rules = toWindsurfRules(mainAgent);
            await fsp.writeFile(path.join(process.cwd(), '.windsurfrules'), rules);
            note(`Regras salvas em .windsurfrules usando o perfil do agente ${mainAgent.name}`, 'Configuração Windsurf');
        }
        
        s.stop('Instalação finalizada!');

    } catch (e) {
        s.stop('Falha');
        console.error(pc.red(e.message));
    }
}

main().catch(console.error);
