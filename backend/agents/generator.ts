import { complete } from './openrouter';

export interface GeneratedFile {
  path: string;
  content: string;
}

const SYSTEM_PROMPT = `You are an expert full-stack software engineer.
Given a project description and a list of development tasks, generate ALL
source code files needed to implement the complete project.

Rules:
- Return ONLY a valid JSON object with a single key "files". No markdown, no code fences.
- "files" is an array of objects, each with "path" (relative file path) and "content" (full file content).
- Every file must be complete and production-quality – no placeholder comments like "// TODO".
- Include: package.json / requirements.txt, all source files, Dockerfile, .env.example, README.md.
- Use modern best practices for the detected tech stack.
- The project must be runnable with a single command (e.g. npm start or python app.py).
- Generated code must include a health-check endpoint or equivalent so the sandbox can verify success.

Output format (raw JSON only, no markdown fences):
{
  "files": [
    { "path": "package.json", "content": "..." },
    { "path": "src/index.ts", "content": "..." }
  ]
}`;

/**
 * Generator Agent: produces all source files for the planned project.
 * Reasoning is enabled so the model thinks through architecture before writing code.
 */
export async function generatorAgent(
  prompt: string,
  tasks: string[]
): Promise<GeneratedFile[]> {
  const taskList = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const { content } = await complete({
    temperature: 0.2,
    max_tokens: 8192,
    reasoning: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Project description:\n${prompt}\n\nDevelopment tasks:\n${taskList}`,
      },
    ],
  });

  const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Generator agent returned invalid JSON`);
  }

  const obj = parsed as Record<string, unknown>;
  const files = obj['files'];
  if (!Array.isArray(files)) throw new Error('Generator agent: missing "files" array');

  return files as GeneratedFile[];
}
