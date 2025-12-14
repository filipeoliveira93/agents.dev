import { AgentDefinition } from '../types';

export function toGeminiSystemPrompt(agent: AgentDefinition): string {
  // Construct the prompt content (System Prompt + Rules + Tools)
  const promptParts = [];

  // Identity logic is usually part of the prompt in this TOML structure
  promptParts.push(`# Identity`);
  promptParts.push(`You are **${agent.name}** ${agent.emoji || ''}`);
  promptParts.push(`Role: ${agent.role}\n`);

  promptParts.push(`# Core Instructions`);
  promptParts.push(agent.systemPrompt.trim());
  promptParts.push('\n');

  if (agent.rules && agent.rules.length > 0) {
    promptParts.push(`# Rules & Guidelines`);
    agent.rules.forEach(rule => promptParts.push(`- ${rule}`));
    promptParts.push('\n');
  }

  if (agent.tools && agent.tools.length > 0) {
    promptParts.push(`# Preferred Tools`);
    agent.tools.forEach(tool => promptParts.push(`- ${tool}`));
    promptParts.push('\n');
  }

  const fullPrompt = promptParts.join('\n');

  // Manual TOML construction
  // 1. description = "..."
  //    Basic escaping for double quotes
  const escapedDescription = agent.role.replace(/"/g, '\\"');
  
  // 2. prompt = """..."""
  //    Escape triple quotes if they exist in the content (rare but possible)
  const escapedPrompt = fullPrompt.replace(/"""/g, '\\"\\"\\"');

  return `description = "${escapedDescription}"
prompt = """
${escapedPrompt}
"""`;
}
