/**
 * GitHub Models fetch client (OpenAI-compatible).
 * Uses the logged-in user's GitHub OAuth token — no separate API key needed.
 * Docs: https://docs.github.com/en/github-models
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  githubToken: string;          // user's decrypted GitHub OAuth token
  model?:      string;
  messages:    Message[];
  temperature?: number;
  max_tokens?:  number;
}

export interface CompletionResult {
  content: string;
}

const BASE_URL      = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o';

export async function complete(opts: CompletionOptions): Promise<CompletionResult> {
  const model = opts.model ?? process.env.AI_MODEL ?? DEFAULT_MODEL;

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${opts.githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages:    opts.messages,
      temperature: opts.temperature,
      max_tokens:  opts.max_tokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GitHub Models error ${res.status}: ${text}`);
  }

  const json = await res.json() as {
    choices: Array<{ message: { content: string } }>;
    error?:  { message: string };
  };

  if (json.error) throw new Error(`GitHub Models: ${json.error.message}`);

  return { content: json.choices[0].message.content ?? '' };
}
