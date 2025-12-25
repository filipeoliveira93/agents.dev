import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';
import { AgentSchema, AgentDefinition } from '../types';
import { toGeminiSystemPrompt } from '../transformers/gemini';
import { toRooRules } from '../transformers/roo';
import { toKiloConfig } from '../transformers/kilo';
import { toOpenCodeCommand } from '../transformers/opencode';
import { parseMarkdownAgents } from '../parsers/markdown';

export async function getAvailableAgents(definitionsDir: string): Promise<Array<{ name: string; slug: string; description?: string }>> {
    if (!(await fs.pathExists(definitionsDir))) {
        return [];
    }

    const agents: Array<{ name: string; slug: string; description?: string }> = [];
    let files: string[] = [];
    let baseDir = definitionsDir;

    const stats = await fs.stat(definitionsDir);
    if (stats.isFile()) {
        baseDir = path.dirname(definitionsDir);
        files = [path.basename(definitionsDir)];
    } else {
        files = await fs.readdir(definitionsDir);
    }

    for (const file of files) {
        const filePath = path.join(baseDir, file);

        if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const rawAgent = YAML.parse(content);
                const parseResult = AgentSchema.safeParse(rawAgent);
                if (parseResult.success) {
                    const slug = file.replace(/\.(yaml|yml)$/, '');
                    agents.push({
                        name: parseResult.data.name,
                        slug: slug,
                        description: parseResult.data.description
                    });
                }
            } catch (e) {}
        } else if (file.endsWith('.md')) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const parsedAgents = parseMarkdownAgents(content);
                for (const agent of parsedAgents) {
                    const parseResult = AgentSchema.safeParse(agent);
                    if (parseResult.success) {
                        agents.push({
                            name: parseResult.data.name,
                            slug: toSlug(parseResult.data.name),
                            description: parseResult.data.description
                        });
                    }
                }
            } catch (e) {}
        }
    }
    return agents.sort((a, b) => a.name.localeCompare(b.name));
}

export async function generateAgents(definitionsDir: string, outDir: string, selectedTargets: string[], agentWhitelist?: string[]): Promise<void> {
    console.log(chalk.blue(`\n📦 Building agents from ${definitionsDir}...`));

    try {
        if (outDir !== process.cwd()) {
            await fs.ensureDir(outDir);
        }

        // Check if input exists
        if (!(await fs.pathExists(definitionsDir))) {
            console.error(chalk.red(`Input not found: ${definitionsDir}`));
            return;
        }

        let files: string[] = [];
        let baseDir = definitionsDir;

        const stats = await fs.stat(definitionsDir);
        if (stats.isFile()) {
            baseDir = path.dirname(definitionsDir);
            files = [path.basename(definitionsDir)];
        } else {
            files = await fs.readdir(definitionsDir);
        }

        for (const file of files) {
            const filePath = path.join(baseDir, file);

            // 1. Handle YAML
            if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                const content = await fs.readFile(filePath, 'utf-8');
                try {
                    const rawAgent = YAML.parse(content);
                    const parseResult = AgentSchema.safeParse(rawAgent);

                    if (!parseResult.success) {
                        logValidationErrors(file, parseResult.error);
                        continue;
                    }

                    // Use filename as slug for YAML (backward compatibility)
                    const slug = file.replace(/\.(yaml|yml)$/, '');

                    if (agentWhitelist && !agentWhitelist.includes(slug)) {
                        continue;
                    }

                    await buildAgentArtifacts(parseResult.data, slug, outDir, selectedTargets);
                } catch (e: any) {
                    console.error(chalk.red(`Error parsing YAML ${file}: ${e.message}`));
                }
            }
            // 2. Handle Markdown
            else if (file.endsWith('.md')) {
                const content = await fs.readFile(filePath, 'utf-8');
                const agents = parseMarkdownAgents(content);

                if (agents.length === 0) {
                    console.warn(chalk.yellow(`⚠️  No agents found in ${file}`));
                    continue;
                }

                for (const agent of agents) {
                    const parseResult = AgentSchema.safeParse(agent);
                    if (!parseResult.success) {
                        logValidationErrors(`${file} -> ${agent.name}`, parseResult.error);
                        continue;
                    }

                    // Use agent name as slug for Markdown
                    const slug = toSlug(agent.name);

                    if (agentWhitelist && !agentWhitelist.includes(slug)) {
                        continue;
                    }

                    await buildAgentArtifacts(agent, slug, outDir, selectedTargets);
                }
            }
        }
        console.log(chalk.bold.green('\n🎉 Build complete! Agents are ready to use.'));
    } catch (err) {
        console.error(chalk.red('Build failed:'), err);
        process.exit(1);
    }
}

async function buildAgentArtifacts(agent: AgentDefinition, slug: string, outDir: string, selectedTargets: string[]) {
    const allTargets = [
        {
            id: 'gemini',
            subDir: '.gemini/commands',
            ext: 'toml',
            content: toGeminiSystemPrompt(agent),
            name: `${slug}.toml`
        },
        {
            id: 'roo',
            subDir: '.roo/commands',
            ext: 'md',
            content: toRooRules(agent),
            name: `${slug}.md`
        },
        {
            id: 'kilo',
            subDir: '.kilocode/workflows',
            ext: 'md',
            content: toKiloConfig(agent),
            name: `${slug}.md`
        },
        {
            id: 'opencode',
            subDir: '.opencode/command',
            ext: 'md',
            content: toOpenCodeCommand(agent),
            name: `${slug}.md`
        }
    ];

    const targetsToBuild = allTargets.filter((t) => selectedTargets.includes(t.id));

    for (const target of targetsToBuild) {
        const targetDir = path.join(outDir, target.subDir);
        await fs.ensureDir(targetDir);
        await fs.writeFile(path.join(targetDir, target.name), target.content);
        console.log(chalk.gray(`  -> ${target.subDir}/${target.name}`));
    }
}

function logValidationErrors(source: string, error: any) {
    console.error(chalk.red(`❌ Validation failed for ${source}:`));
    error.issues.forEach((err: any) => {
        console.error(chalk.red(`  - ${err.path.join('.')}: ${err.message}`));
    });
}

function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-word chars
        .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores to hyphens
        .replace(/^-+|-+$/g, ''); // trim hyphens
}
