import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { AgentDefinition, AgentSchema } from './types';
import { toGeminiSystemPrompt } from './transformers/gemini';
import { toRooRules } from './transformers/roo';
import { toKiloConfig } from './transformers/kilo';
import { toOpenCodeCommand } from './transformers/opencode';

const program = new Command();

program
  .name('agents')
  .description('Agent Installer CLI')
  .version('1.0.0');

program
  .command('build')
  .description('Build agent definitions into target formats')
  .option('-o, --out <dir>', 'Output directory', '.')
  .option('-t, --target <targets>', 'Comma-separated target formats (gemini, roo, kilo, opencode)')
  .action(async (options) => {
    const definitionsDir = path.join(process.cwd(), 'definitions');
    const outDir = path.resolve(options.out);

    // Determine targets
    let selectedTargets: string[] = [];
    if (options.target) {
      selectedTargets = options.target.split(',').map((t: string) => t.trim().toLowerCase());
    } else {
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'targets',
          message: 'Select target formats to build:',
          choices: [
            { name: 'Gemini CLI', value: 'gemini', checked: true },
            { name: 'Roo Code', value: 'roo', checked: false },
            { name: 'Kilo Code', value: 'kilo', checked: false },
            { name: 'OpenCode', value: 'opencode', checked: false }
          ],
          validate: (answer) => {
            if (answer.length < 1) {
              return 'You must choose at least one target.';
            }
            return true;
          }
        }
      ]);
      selectedTargets = answers.targets;
    }

    if (selectedTargets.length === 0) {
      console.log(chalk.yellow('No targets selected. Exiting.'));
      return;
    }

    console.log(chalk.blue(`Building agents from ${definitionsDir} to ${outDir}...`));
    console.log(chalk.blue(`Targets: ${selectedTargets.join(', ')}`));

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
           console.error(chalk.red(`Validation failed for ${file}:`));
           parseResult.error.issues.forEach((err) => {
             console.error(chalk.red(`  - ${err.path.join('.')}: ${err.message}`));
           });
           continue; // Skip this agent
        }

        const agent = parseResult.data;
        const slug = file.replace(/\.(yaml|yml)$/, '');

        console.log(chalk.green(`Processing agent: ${agent.name} (${slug})`));

        // specific outputs
        const allTargets = [
          {
            id: 'gemini',
            subDir: '.gemini/commands/dev',
            ext: 'md',
            content: toGeminiSystemPrompt(agent),
            name: `${slug}.md`
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
      console.log(chalk.bold.green('Build complete!'));
      
    } catch (err) {
      console.error(chalk.red('Build failed:'), err);
      process.exit(1);
    }
  });

program.parse(process.argv);
