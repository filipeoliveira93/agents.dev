import { AgentDefinition } from '../types';

export function toRooRules(agent: AgentDefinition): string {
  // Roo Code / Cline usually expects a clear set of rules and role definition.
  const parts = [];

  parts.push(`# ${agent.name} (${agent.role})`);
  parts.push(`\n${agent.systemPrompt.trim()}\n`);

  if (agent.rules && agent.rules.length > 0) {
    parts.push(`## Analytical Rules & Guidelines`);
    agent.rules.forEach(rule => parts.push(`- ${rule}`));
    parts.push('\n');
  }

  // Tools might be handled differently in Roo, but listing them as preferences is safe
  if (agent.tools && agent.tools.length > 0) {
    parts.push(`## Tool Usage Preferences`);
    agent.tools.forEach(tool => parts.push(`- Prefer using ${tool} when applicable.`));
  }

  return parts.join('\n');
}
