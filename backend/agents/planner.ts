import { complete } from './openrouter';

const SYSTEM_PROMPT = `You are an expert software architect and project planner.
Given a user's request, decompose it into a precise, ordered list of development tasks.
Each task must be a single, actionable item directly relevant to what was asked.

Rules:
- Return ONLY a JSON array of strings – no markdown, no explanations, no code fences.
- Each string is one task description (max 200 characters).
- Produce between 3 and 15 tasks – use only as many as the request actually needs.
- Tasks must be specific to the user's request. Do NOT add generic boilerplate tasks
  (ESLint, Prettier, tsconfig, .gitignore, etc.) unless the user explicitly asked for them.
- Only choose a tech stack if the user specifies one; otherwise infer from context.
- For simple requests (e.g. "add a README", "create a config file"), produce 1–3 tasks.
- Order tasks from foundational to high-level.

Output format – raw JSON array only, no markdown:
["<task 1>", "<task 2>", ...]`;

export async function plannerAgent(prompt: string, githubToken: string): Promise<string[]> {
  const { content } = await complete({
    githubToken,
    temperature: 0.3,
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
