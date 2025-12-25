import { AgentDefinition } from '../types';

export function toOpenCodeCommand(agent: AgentDefinition): string {
  // OpenCode generic config/prompt
  const parts = [];

  parts.push(`<!--- OpenCode Agent Config --->`);
  parts.push(`# ${agent.name} ${agent.emoji || ''}`);
  parts.push(`**Role**: ${agent.role}\n`);

  parts.push(`## Instructions`);
  parts.push(agent.systemPrompt.trim());
  parts.push('\n');

  if (agent.rules && agent.rules.length > 0) {
    parts.push(`## Constraints`);
    agent.rules.forEach(rule => parts.push(`- ${rule}`));
  }

  return parts.join('\n');
}
