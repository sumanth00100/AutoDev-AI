/**
 * GitHub Models fetch client (OpenAI-compatible).
 * Uses the logged-in user's GitHub OAuth token — no separate API key needed.
 * Docs: https://docs.github.com/en/github-models
 */

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  githubToken: string; // user's decrypted GitHub OAuth token
  model?: string;
  messages: Message[];
  max_completion_tokens?: number;
}

export interface CompletionResult {
  content: string;
}

const BASE_URL      = "https://models.github.ai/inference/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o";
const MAX_RETRIES   = 4;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function complete(
  opts: CompletionOptions
): Promise<CompletionResult> {
  const model = opts.model ?? process.env.AI_MODEL ?? DEFAULT_MODEL;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: opts.messages,
        max_completion_tokens: opts.max_completion_tokens,
      }),
    });

    if (res.status === 429) {
      if (attempt === MAX_RETRIES) {
        throw new Error(`GitHub Models rate limit exceeded after ${MAX_RETRIES} retries. Please wait a moment and try again.`);
      }
      const retryAfter = res.headers.get("retry-after");
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 10000 * Math.pow(2, attempt);
      console.warn(`[GitHubModels] 429 rate limit — attempt ${attempt + 1}/${MAX_RETRIES + 1}, waiting ${Math.round(waitMs / 1000)}s…`);
      await sleep(waitMs);
      continue;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`GitHub Models error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
      error?: { message: string };
    };

    if (json.error) throw new Error(`GitHub Models: ${json.error.message}`);

    return { content: json.choices[0].message.content ?? "" };
  }

  throw new Error("GitHub Models: exhausted all retry attempts");
}
