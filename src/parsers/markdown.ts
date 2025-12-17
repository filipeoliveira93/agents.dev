import { AgentDefinition } from '../types';

export function parseMarkdownAgents(content: string): AgentDefinition[] {
  const agents: AgentDefinition[] = [];
  
  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n');
  
  // Split by H1 headers (# Name)
  // We use a lookahead to keep the delimiter or just split and ignore the first empty part if it starts with #
  const parts = normalized.split(/^# /gm);

  for (const part of parts) {
    if (!part.trim()) continue;

    const lines = part.split('\n');
    const headerLine = lines[0].trim();
    
    // Extract emoji if present at the end
    // E.g. "Project Manager 👩‍💼" -> name: "Project Manager", emoji: "👩‍💼"
    // Simple emoji regex or just take the last char if it looks like an emoji? 
    // Let's generic split by space and check if last part is emoji-like or just treat whole as name
    // A simplified approach: regex for emoji is complex, let's just grab the whole string as name for now, 
    // or try to extract the last non-word character if it looks like a symbol.
    // Spec said: "# Agent Name [Emoji]"
    
    const emojiMatch = headerLine.match(/^(.*?)\s+([^\w\s\d]+)$/);
    let name = headerLine;
    let emoji = '';
    
    if (emojiMatch) {
      name = emojiMatch[1].trim();
      emoji = emojiMatch[2].trim();
    }
    
    const remainingLines = lines.slice(1);
    const sectionContent = remainingLines.join('\n');

    // Parse sections
    // > Role
    // ## System Prompt
    // ## Rules
    // ## Tools

    let role = '';
    let systemPrompt = '';
    const rules: string[] = [];
    const tools: string[] = [];

    // Extract Role (Blockquote)
    const roleMatch = sectionContent.match(/^\s*>\s*(.+)$/m);
    if (roleMatch) {
      role = roleMatch[1].trim();
    }

    // specific sections
    const sections = sectionContent.split(/^## /gm);
    
    for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed) continue;
        
        const sectionLines = trimmed.split('\n');
        const sectionTitle = sectionLines[0].trim().toLowerCase();
        const sectionBody = sectionLines.slice(1).join('\n').trim();

        if (sectionTitle.includes('system prompt') || sectionTitle.includes('instructions')) {
            systemPrompt = sectionBody;
        } else if (sectionTitle.includes('rules')) {
            // Extract bullets
             const bullets = sectionBody.split('\n')
                .map(l => l.trim())
                .filter(l => l.startsWith('- ') || l.startsWith('* '))
                .map(l => l.substring(2).trim());
             rules.push(...bullets);
        } else if (sectionTitle.includes('tools')) {
             const bullets = sectionBody.split('\n')
                .map(l => l.trim())
                .filter(l => l.startsWith('- ') || l.startsWith('* '))
                .map(l => l.substring(2).trim());
             tools.push(...bullets);
        }
    }

    if (name) {
       agents.push({
           name,
           role,
           emoji,
           systemPrompt,
           rules,
           tools
       });
    }
  }

  return agents;
}
