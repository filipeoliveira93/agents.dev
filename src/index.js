#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { intro, outro, multiselect, select, spinner, note } = require('@clack/prompts');
const pc = require('picocolors');

// Módulos Internos
const { AgentSchema } = require('./lib/schema');
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

    const definitionsDir = path.join(__dirname, '..', 'definitions');
    if (!fs.existsSync(definitionsDir)) {
        s.stop('Falha');
        note(`Pasta de definições não encontrada: ${definitionsDir}`, 'Erro Fatal');
        return;
    }

    const files = fs.readdirSync(definitionsDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    const validAgents = [];

    // Validação e Carregamento
    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(definitionsDir, file), 'utf8');
            const raw = yaml.load(content);
            
            // Validação com Zod
            const parsed = AgentSchema.safeParse(raw);
            if (!parsed.success) {
                console.warn(pc.yellow(`⚠️  Ignorando ${file}: Inválido`));
                continue;
            }

            const agent = parsed.data;
            agent.slug = file.replace(/\.ya?ml$/, '').replace(/\./g, '-'); // dev.coder -> dev-coder
            validAgents.push(agent);

        } catch (e) {
            console.error(pc.red(`Erro ao ler ${file}: ${e.message}`));
        }
    }

    s.message(`Instalando ${validAgents.length} agentes para ${tool}...`);

    // Instalação Específica por Ferramenta
    try {
        if (tool === 'gemini') {
            const targetDir = path.join(process.cwd(), '.gemini', 'commands', 'dev');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            for (const agent of validAgents) {
                const toml = toGeminiTOML(agent);
                // Nome original com pontos (dev.coder.toml) é preferível para Gemini CLI
                const fileName = `${agent.slug.replace(/-/g, '.')}.toml`; 
                fs.writeFileSync(path.join(targetDir, fileName), toml);
            }
        } 
        else if (tool === 'roo' || tool === 'cline') {
            const modes = validAgents.map(agent => toRooConfig(agent, agent.slug));
            const jsonContent = JSON.stringify({ customModes: modes }, null, 2);
            const fileName = `${tool}_custom_modes.json`;
            fs.writeFileSync(path.join(process.cwd(), fileName), jsonContent);
            note(`Copie o conteúdo de '${fileName}' para as configurações da extensão.`, 'Ação Manual');
        } 
        else if (tool === 'kilo') {
            const targetDir = path.join(process.cwd(), '.kilo', 'prompts');
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            for (const agent of validAgents) {
                const md = toKiloMarkdown(agent);
                fs.writeFileSync(path.join(targetDir, `${agent.slug}.md`), md);
            }
        }
        s.stop('Instalação finalizada!');

    } catch (e) {
        s.stop('Falha');
        console.error(pc.red(e.message));
    }
}

main().catch(console.error);
