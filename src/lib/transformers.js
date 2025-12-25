/**
 * Converte definição do agente para TOML do Gemini CLI
 */
function toGeminiTOML(agent) {
    // Escapa aspas duplas na descrição
    const description = (agent.description || agent.role).replace(/"/g, '\\"');
    
    // Constrói o prompt completo
    const parts = [
        `# Identity`,
        `You are **${agent.name}** ${agent.emoji}`,
        `Role: ${agent.role}\n`,
        `# Core Instructions`,
        agent.systemPrompt.trim(),
        '\n'
    ];

    if (agent.rules && agent.rules.length > 0) {
        parts.push(`# Rules & Guidelines`);
        agent.rules.forEach(rule => parts.push(`- ${rule}`));
        parts.push('\n');
    }

    const fullPrompt = parts.join('\n');
    
    // Escapa aspas triplas para o bloco multilinha TOML
    const escapedPrompt = fullPrompt.replace(/"""/g, '\\"\\\"\\"');
    
    // Monta o TOML final
    let toml = `description = "${description}"\n`;
    toml += `prompt = """\n${escapedPrompt}\n"""\n`;
    
    // Mantém rules como array separado se a ferramenta suportar (Gemini CLI suporta)
    if (agent.rules && agent.rules.length > 0) {
        toml += 'rules = [\n';
        agent.rules.forEach(rule => {
            const escaped = rule.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            toml += `  "${escaped}",\n`;
        });
        toml += ']\n';
    }

    return toml;
}

/**
 * Converte para configuração de Custom Mode do Roo Code / Cline (JSON)
 */
function toRooConfig(agent, slug) {
    const promptParts = [
        `# ${agent.name} (${agent.role})`,
        `\n${agent.systemPrompt.trim()}\n`
    ];

    if (agent.rules && agent.rules.length > 0) {
        promptParts.push(`## Rules & Guidelines`);
        agent.rules.forEach(rule => promptParts.push(`- ${rule}`));
    }

    return {
        slug: slug,
        name: `${agent.emoji} ${agent.name}`,
        roleDefinition: promptParts.join('\n'),
        groups: ["read", "edit", "browser", "command", "mcp"]
    };
}

/**
 * Converte para Markdown do Kilo Code
 */
function toKiloMarkdown(agent) {
    const parts = [
        `<!--- Kilo Code Agent Config --->`,
        `# ${agent.name} ${agent.emoji}`,
        `**Role**: ${agent.role}\n`,
        `## Instructions`,
        agent.systemPrompt.trim(),
        '\n'
    ];

    if (agent.rules && agent.rules.length > 0) {
        parts.push(`## Constraints`);
        agent.rules.forEach(rule => parts.push(`- ${rule}`));
    }

    return parts.join('\n');
}

/**
 * Converte para Instruções do GitHub Copilot (.github/copilot-instructions.md)
 */
function toCopilotInstructions(agent) {
    const parts = [
        `<!-- GitHub Copilot Instructions for ${agent.name} -->`,
        `# Identity and Role`,
        `You are **${agent.name}** ${agent.emoji}.`,
        `**Role**: ${agent.role}`,
        `\n## Core Instructions`,
        agent.systemPrompt.trim(),
        '\n'
    ];

    if (agent.rules && agent.rules.length > 0) {
        parts.push(`## Rules & Guidelines`);
        agent.rules.forEach(rule => parts.push(`- ${rule}`));
    }
    
    // Adiciona uma seção de estilo de resposta para garantir conformidade
    parts.push(`\n## Response Style`);
    parts.push(`- Be concise and objective.`);
    parts.push(`- Use Portuguese (Brazil) unless told otherwise.`);
    parts.push(`- Follow the project conventions defined in the workspace.`);

    return parts.join('\n');
}

module.exports = { toGeminiTOML, toRooConfig, toKiloMarkdown, toCopilotInstructions };
