import { complete } from './openrouter';

const SYSTEM_PROMPT = `You are an expert software architect and project planner.
Given a user's description of a software project, decompose it into a precise,
ordered list of development tasks. Each task must be a single, actionable item
(e.g. "Create Express REST API with /users endpoint").

Rules:
- Return ONLY a JSON array of strings – no markdown, no explanations, no code fences.
- Each string is one task description (max 200 characters).
- Produce between 5 and 20 tasks.
- Order tasks from foundational (setup, config) to high-level (features, tests).
- Be specific enough that a developer can implement each task independently.

Example output:
["Initialize Node.js project with TypeScript", "Set up PostgreSQL schema for users table", ...]`;

/**
 * Planner Agent: converts a project description into an ordered task list.
 * Uses chain-of-thought reasoning to produce well-structured plans.
 */
export async function plannerAgent(prompt: string): Promise<string[]> {
  const { content } = await complete({
    temperature: 0.3,
    reasoning: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: `Project description:\n\n${prompt}` },
    ],
  });

  const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Planner agent returned invalid JSON: ${content}`);
  }

  if (Array.isArray(parsed)) return parsed as string[];
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    const arr = obj['tasks'] ?? obj['steps'] ?? obj['items'] ?? Object.values(obj)[0];
    if (Array.isArray(arr)) return arr as string[];
  }

  throw new Error(`Planner agent returned unexpected shape: ${content}`);
}
