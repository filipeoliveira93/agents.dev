import { AgentDefinition } from '../types';

export function toGeminiSystemPrompt(agent: AgentDefinition): string {
  const parts = [];

  // Identity
  parts.push(`# Identity\n`);
  parts.push(`You are **${agent.name}** ${agent.emoji || ''}`);
  parts.push(`Role: ${agent.role}\n`);

  // System Prompt
  parts.push(`# Core Instructions\n`);
  parts.push(agent.systemPrompt.trim());
  parts.push('\n');

  // Rules
  if (agent.rules && agent.rules.length > 0) {
    parts.push(`# Rules & Guidelines\n`);
    agent.rules.forEach(rule => parts.push(`- ${rule}`));
    parts.push('\n');
  }

  // Tools (if any)
  if (agent.tools && agent.tools.length > 0) {
    parts.push(`# Preferred Tools\n`);
    agent.tools.forEach(tool => parts.push(`- ${tool}`));
    parts.push('\n');
  }

  return parts.join('\n');
}
