/**
 * Shared OpenRouter fetch client with reasoning support.
 * All agents use this instead of the OpenAI SDK so we can pass
 * OpenRouter-specific fields (e.g. `reasoning`) freely.
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning_details?: unknown; // preserved from a previous assistant turn
}

export interface CompletionOptions {
  model?: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  reasoning?: boolean; // enables chain-of-thought reasoning
}

export interface CompletionResult {
  content: string;
  reasoning_details?: unknown;
}

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

export async function complete(opts: CompletionOptions): Promise<CompletionResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const model = opts.model ?? process.env.AI_MODEL ?? DEFAULT_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages: opts.messages,
    ...(opts.temperature !== undefined && { temperature: opts.temperature }),
    ...(opts.max_tokens   !== undefined && { max_tokens: opts.max_tokens }),
    ...(opts.reasoning    !== false     && { reasoning: { enabled: true } }),
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/autodev-ai',
      'X-Title': 'AutoDev AI',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const json = await res.json() as {
    choices: Array<{
      message: { content: string; reasoning_details?: unknown };
    }>;
    error?: { message: string };
  };

  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);

  const msg = json.choices[0].message;
  return { content: msg.content ?? '', reasoning_details: msg.reasoning_details };
}
