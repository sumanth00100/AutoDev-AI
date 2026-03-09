import { complete } from './openrouter';
import { GeneratedFile } from './generator';

const SYSTEM_PROMPT = `You are an expert debugging engineer.
You will receive:
1. The original project description
2. All current source files
3. The stdout/stderr output from a failed Docker sandbox execution

Your job is to diagnose the root cause of the failure and return a corrected,
complete set of source files that will fix the issue.

Rules:
- Return ONLY a valid JSON object with a single key "files". No markdown, no code fences.
- Include ALL files (not just changed ones) – the full corrected project.
- Make minimal changes to fix the issue; do not rewrite unrelated code.
- Do not add placeholder comments. All code must be production-ready.
- If the error is a missing dependency, add it to package.json/requirements.txt.
- If the error is a syntax or logic error, fix it precisely.

Output format (raw JSON only, no markdown fences):
{
  "files": [
    { "path": "package.json", "content": "..." },
    { "path": "src/index.ts", "content": "..." }
  ]
}`;

export async function debuggerAgent(
  prompt:       string,
  currentFiles: GeneratedFile[],
  errorOutput:  string,
  githubToken:  string
): Promise<GeneratedFile[]> {
  const filesSummary = currentFiles
    .map((f) => {
      const truncated = f.content.length > 3000
        ? f.content.slice(0, 3000) + '\n... [truncated]'
        : f.content;
      return `=== ${f.path} ===\n${truncated}`;
    })
    .join('\n\n');

  const { content } = await complete({
    githubToken,
    temperature: 0.1,
    max_completion_tokens:  8192,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role:    'user',
        content: [
          `Original project description:\n${prompt}`,
          `\nCurrent source files:\n${filesSummary}`,
          `\nError output from sandbox:\n${errorOutput}`,
        ].join('\n'),
      },
    ],
  });

  const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Debugger agent returned invalid JSON');
  }

  const obj   = parsed as Record<string, unknown>;
  const files = obj['files'];
  if (!Array.isArray(files)) throw new Error('Debugger agent: missing "files" array');

  return files as GeneratedFile[];
}
