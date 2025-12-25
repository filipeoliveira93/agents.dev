#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { generateWorkflowGuide } from './generators/docs';
import { generateAgents, getAvailableAgents } from './generators/agents';

const program = new Command();

program
    .name('agents')
    .description('Agent Installer CLI')
    .version('1.0.4');

program.command('init')
    .description('Initialize agents configuration interactively')
    .option('-o, --out <dir>', 'Output directory', '.')
    .option('-i, --input <path>', 'Input file or directory (default: definitions/ or agents.md)')
    .option('-t, --target <targets>', 'Comma-separated target formats (gemini, roo, kilo, opencode)')
    .action(async (options) => {
        // Safety check for non-interactive environments (CI/CD)
        if (!process.stdout.isTTY || process.env.CI === 'true' || process.env.CI === '1') {
            console.log(chalk.yellow('Skipping interactive installer (non-interactive environment detected).'));
            console.log(chalk.gray('Run "npx agents.dev" manually to configure your agents.'));
            return;
        }

        try {
            console.log(chalk.bold.blue('\n🚀 Agents.dev Installer Wizard\n'));

            // --- STEP 1: INITIALIZATION (Docs & Shell) ---
            const docsDir = path.join(process.cwd(), 'docs');

            // Check if docs directory exists
            if (!(await fs.pathExists(docsDir))) {
                console.log(chalk.yellow('ℹ️  Project documentation structure not found.'));

                const initAnswers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'shell',
                        message: 'Initialize validation: Which shell do you use?',
                        choices: [
                            { name: 'Windows (CMD/PowerShell)', value: 'win32' },
                            { name: 'Unix-like (Bash/Zsh/Ubuntu)', value: 'unix' }
                        ]
                    }
                ]);

                await generateWorkflowGuide(docsDir, initAnswers.shell);
            } else {
                console.log(chalk.gray('✅ "docs/" directory already exists.\n'));
            }

            // --- STEP 2: BUILD AGENTS ---
            let inputPath = options.input ? path.resolve(options.input) : path.join(process.cwd(), 'definitions');

            // If default definitions dir doesn't exist and no input specified, try agents.md
            if (!options.input && !(await fs.pathExists(inputPath))) {
                const localAgentsMd = path.join(process.cwd(), 'agents.md');
                if (await fs.pathExists(localAgentsMd)) {
                    inputPath = localAgentsMd;
                    console.log(chalk.gray(`ℹ️  Using 'agents.md' found in root.`));
                } else {
                    // Fallback: Check if we are running from the installed package and definitions exist there
                    const packageDefinitions = path.join(__dirname, '../definitions');
                    if (await fs.pathExists(packageDefinitions)) {
                        inputPath = packageDefinitions;
                        // console.log(chalk.gray(`ℹ️  Using default definitions from package.`));
                    }
                }
            }

            const outDir = path.resolve(options.out);

            // Determine targets
            let selectedTargets: string[] = [];
            if (options.target) {
                selectedTargets = options.target.split(',').map((t: string) => t.trim().toLowerCase());
            } else {
                const buildAnswers = await inquirer.prompt([
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
                selectedTargets = buildAnswers.targets;
            }

            if (selectedTargets.length === 0) {
                console.log(chalk.yellow('No targets selected. Exiting.'));
                return;
            }

            // --- STEP 3: SELECT AGENTS ---
            let selectedAgents: string[] | undefined = undefined;
            const availableAgents = await getAvailableAgents(inputPath);

            if (availableAgents.length > 0) {
                const agentSelection = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'mode',
                        message: 'How do you want to install agents?',
                        choices: [
                            { name: 'Install All Standard Agents (Recommended)', value: 'all' },
                            { name: 'Custom Selection', value: 'custom' }
                        ]
                    },
                    {
                        type: 'checkbox',
                        name: 'agents',
                        message: 'Select agents to install:',
                        choices: availableAgents.map((a) => ({
                            name: a.description ? `${a.name} - ${chalk.gray(a.description)}` : a.name,
                            value: a.slug,
                            checked: true
                        })),
                        when: (answers) => answers.mode === 'custom',
                        validate: (answer) => {
                            if (answer.length < 1) {
                                return 'You must choose at least one agent.';
                            }
                            return true;
                        }
                    }
                ]);

                if (agentSelection.mode === 'custom') {
                    selectedAgents = agentSelection.agents;
                }
            }

            await generateAgents(inputPath, outDir, selectedTargets, selectedAgents);
        } catch (error: any) {
            if (error.isTtyError) {
                console.log(chalk.yellow('Interactive prompt not supported in this environment.'));
            } else if (error.message.includes('User force closed')) {
                console.log(chalk.yellow('\nInstallation cancelled by user.'));
            } else {
                console.error(chalk.red('\nAn error occurred during installation:'), error.message);
            }
            // Always exit with 0 to prevent npm install from failing loudly
            process.exit(0);
        }
    });

// Default command (show help if no command)
program.action(() => {
    program.help();
});

program.parse(process.argv);
