import { z } from 'zod';

export const AgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  description: z.string().optional(),
  emoji: z.string().optional(),
  systemPrompt: z.string().min(10, "System prompt must be at least 10 characters"),
  rules: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional()
});

export type AgentDefinition = z.infer<typeof AgentSchema>;
