const { z } = require('zod');

const AgentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.string().min(1, "Papel (Role) é obrigatório"),
  emoji: z.string().optional().default('🤖'),
  systemPrompt: z.string().min(10, "System Prompt deve ter pelo menos 10 caracteres"),
  rules: z.array(z.string()).optional().default([]),
  tools: z.array(z.string()).optional().default([]),
  description: z.string().optional()
});

module.exports = { AgentSchema };
