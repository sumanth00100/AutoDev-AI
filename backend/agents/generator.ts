import { complete } from './openrouter';

export interface GeneratedFile {
  path:    string;
  content: string;
}

const SYSTEM_PROMPT = `You are an expert full-stack software engineer.
Given a project description and a list of development tasks, generate ALL
source code files needed to implement the complete project.

Rules:
- Return ONLY a valid JSON object with a single key "files". No markdown, no code fences.
- "files" is an array of objects, each with "path" (relative file path) and "content" (full file content).
- Every file must be complete and production-quality – no placeholder comments like "// TODO".
- Include: package.json / requirements.txt, all source files, .env.example (if needed), README.md.
- Do NOT include a Dockerfile unless the user explicitly asked for one.
- Use modern best practices for the detected tech stack.
- The project must be runnable with a single command (e.g. npm start or python app.py).

Output format (raw JSON only, no markdown fences):
{
  "files": [
    { "path": "package.json", "content": "..." },
    { "path": "src/index.ts", "content": "..." }
  ]
}`;

export async function generatorAgent(
  prompt:      string,
  tasks:       string[],
  githubToken: string,
  model?:      string
): Promise<GeneratedFile[]> {
  const taskList = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const { content } = await complete({
    githubToken,
    model,
    temperature: 0.2,
    max_completion_tokens:  16000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role:    'user',
        content: `Project description:\n${prompt}\n\nDevelopment tasks:\n${taskList}`,
      },
    ],
  });

  // Strip markdown fences, then extract the outermost {...} object in case
  // the model prefixed/suffixed it with explanation text or truncated slightly.
  const stripped = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const start    = stripped.indexOf('{');
  const end      = stripped.lastIndexOf('}');
  const cleaned  = start !== -1 && end > start ? stripped.slice(start, end + 1) : stripped;

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Generator agent returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const obj   = parsed as Record<string, unknown>;
  const files = obj['files'];
  if (!Array.isArray(files)) throw new Error('Generator agent: missing "files" array');

  return files as GeneratedFile[];
}
