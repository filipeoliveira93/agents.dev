const fs = require('fs/promises');
const path = require('path');
const yaml = require('js-yaml');
const { AgentSchema } = require('./schema');
const pc = require('picocolors');

/**
 * Carrega e valida todas as definições de agentes da pasta definitions
 * @returns {Promise<Array>} Lista de agentes validados
 */
async function loadAgents() {
    const definitionsDir = path.join(__dirname, '..', '..', 'definitions');
    
    try {
        await fs.access(definitionsDir);
    } catch {
        throw new Error(`Pasta de definições não encontrada: ${definitionsDir}`);
    }

    const files = await fs.readdir(definitionsDir);
    const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    
    // Leitura e processamento em paralelo
    const results = await Promise.all(yamlFiles.map(async (file) => {
        try {
            const content = await fs.readFile(path.join(definitionsDir, file), 'utf8');
            const raw = yaml.load(content);
            
            const parsed = AgentSchema.safeParse(raw);
            if (!parsed.success) {
                return { 
                    success: false, 
                    file, 
                    error: 'Validação do Schema falhou',
                    details: parsed.error.format()
                };
            }

            const agent = parsed.data;
            // Normaliza o slug: dev.coder -> dev-coder
            agent.slug = file.replace(/\.ya?ml$/, '').replace(/\./g, '-');
            // Mantém o nome original do arquivo para referência (útil para Gemini CLI)
            agent.originalName = file.replace(/\.ya?ml$/, '');
            
            return { success: true, agent };

        } catch (e) {
            return { success: false, file, error: e.message };
        }
    }));

    // Separa sucessos e falhas
    const validAgents = [];
    const errors = [];

    results.forEach(res => {
        if (res.success) {
            validAgents.push(res.agent);
        } else {
            errors.push(res);
            console.warn(pc.yellow(`⚠️  Ignorando ${res.file}: ${res.error}`));
        }
    });

    return validAgents;
}

module.exports = { loadAgents };
