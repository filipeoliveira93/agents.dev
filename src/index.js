#!/usr/bin/env node

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { intro, outro, multiselect, select, spinner, note } = require('@clack/prompts');
const pc = require('picocolors');

// Módulos Internos
const { loadAgents } = require('./lib/agents');
const { toGeminiTOML, toRooConfig, toKiloMarkdown } = require('./lib/transformers');
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
            { value: 'vscode', label: 'Configurar VS Code', hint: '(Simulado)' },
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
                { value: 'roo', label: 'Roo Code', hint: 'Gera roo_custom_modes.json' },
                { value: 'cline', label: 'Cline', hint: 'Gera cline_custom_modes.json' },
                { value: 'kilo', label: 'Kilo Code', hint: '.kilo/prompts/*.md' },
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
            const modes = validAgents.map(agent => toRooConfig(agent, agent.slug));
            const jsonContent = JSON.stringify({ customModes: modes }, null, 2);
            const fileName = `${tool}_custom_modes.json`;
            await fsp.writeFile(path.join(process.cwd(), fileName), jsonContent);
            note(`Copie o conteúdo de '${fileName}' para as configurações da extensão.`, 'Ação Manual');
        } 
        else if (tool === 'kilo') {
            const targetDir = path.join(process.cwd(), '.kilo', 'prompts');
            await fsp.mkdir(targetDir, { recursive: true });

            await Promise.all(validAgents.map(agent => {
                const md = toKiloMarkdown(agent);
                return fsp.writeFile(path.join(targetDir, `${agent.slug}.md`), md);
            }));
        }
        
        s.stop('Instalação finalizada!');

    } catch (e) {
        s.stop('Falha');
        console.error(pc.red(e.message));
        // Se for um erro fatal de pasta não encontrada, loadAgents já lançou throw
    }
}

main().catch(console.error);
