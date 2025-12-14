import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';
import { AgentSchema } from '../types';
import { toGeminiSystemPrompt } from '../transformers/gemini';
import { toRooRules } from '../transformers/roo';
import { toKiloConfig } from '../transformers/kilo';
import { toOpenCodeCommand } from '../transformers/opencode';

export async function generateAgents(definitionsDir: string, outDir: string, selectedTargets: string[]): Promise<void> {
  console.log(chalk.blue(`\n📦 Building agents from ${definitionsDir}...`));

  try {
    if (outDir !== process.cwd()) {
        await fs.ensureDir(outDir);
    }
    
    const files = await fs.readdir(definitionsDir);
    
    for (const file of files) {
      if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;

      const content = await fs.readFile(path.join(definitionsDir, file), 'utf-8');
      const rawAgent = YAML.parse(content);
      const parseResult = AgentSchema.safeParse(rawAgent);

      if (!parseResult.success) {
          console.error(chalk.red(`❌ Validation failed for ${file}:`));
          parseResult.error.issues.forEach((err) => {
            console.error(chalk.red(`  - ${err.path.join('.')}: ${err.message}`));
          });
          continue; // Skip this agent
      }

      const agent = parseResult.data;
      const slug = file.replace(/\.(yaml|yml)$/, '');
      
      // specific outputs
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

      const targetsToBuild = allTargets.filter(t => selectedTargets.includes(t.id));

      for (const target of targetsToBuild) {
        const targetDir = path.join(outDir, target.subDir);
        await fs.ensureDir(targetDir);
        await fs.writeFile(path.join(targetDir, target.name), target.content);
        console.log(chalk.gray(`  -> ${target.subDir}/${target.name}`));
      }
    }
    console.log(chalk.bold.green('\n🎉 Build complete! Agents are ready to use.'));
    
  } catch (err) {
    console.error(chalk.red('Build failed:'), err);
    process.exit(1);
  }
}
