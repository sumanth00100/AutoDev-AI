'use client';

import { useState } from 'react';
import { PromptInput }   from '@/components/PromptInput';
import { StatusBadge }   from '@/components/StatusBadge';
import { LogConsole }    from '@/components/LogConsole';
import { TaskList }      from '@/components/TaskList';
import { RepoList }      from '@/components/RepoList';
import { useAutoEngineerJob } from '@/hooks/useAutoEngineerJob';
import { useAuth }       from '@/hooks/useAuth';

const MODELS = [
  // ── OpenAI ───────────────────────────────────────────────
  { id: 'openai/gpt-4o',                        label: 'GPT-4o',             note: 'OpenAI · default · fast' },
  { id: 'openai/gpt-4o-mini',                   label: 'GPT-4o mini',        note: 'OpenAI · fastest · lightweight' },
  { id: 'openai/gpt-4.1',                       label: 'GPT-4.1',            note: 'OpenAI · versatile' },
  { id: 'openai/gpt-4.1-mini',                  label: 'GPT-4.1 mini',       note: 'OpenAI · fast' },
  { id: 'openai/gpt-5',                         label: 'GPT-5',              note: 'OpenAI · highly intelligent' },
  { id: 'openai/gpt-5-mini',                    label: 'GPT-5 mini',         note: 'OpenAI · fast & cost-efficient' },
  { id: 'openai/o3',                            label: 'o3',                 note: 'OpenAI · reasoning · powerful' },
  { id: 'openai/o3-mini',                       label: 'o3-mini',            note: 'OpenAI · reasoning · fast' },
  { id: 'openai/o4-mini',                       label: 'o4-mini',            note: 'OpenAI · reasoning · latest' },
  // ── Meta / Llama ─────────────────────────────────────────
  { id: 'meta/meta-llama-3.1-405b-instruct',    label: 'Llama 3.1 405B',     note: 'Meta · open · very capable' },
  { id: 'meta/llama-3.3-70b-instruct',          label: 'Llama 3.3 70B',      note: 'Meta · open · balanced' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct-fp8', label: 'Llama 4 Maverick', note: 'Meta · latest · multimodal' },
  // ── DeepSeek ─────────────────────────────────────────────
  { id: 'deepseek/deepseek-r1',                 label: 'DeepSeek R1',        note: 'DeepSeek · reasoning · open' },
  { id: 'deepseek/deepseek-v3-0324',            label: 'DeepSeek V3',        note: 'DeepSeek · versatile' },
  // ── Mistral ──────────────────────────────────────────────
  { id: 'mistral-ai/codestral-2501',            label: 'Codestral',          note: 'Mistral · code-specialized' },
  { id: 'mistral-ai/mistral-medium-2505',       label: 'Mistral Medium',     note: 'Mistral · balanced' },
  // ── xAI ──────────────────────────────────────────────────
  { id: 'xai/grok-3',                           label: 'Grok 3',             note: 'xAI · versatile' },
  { id: 'xai/grok-3-mini',                      label: 'Grok 3 mini',        note: 'xAI · fast' },
  // ── Microsoft ────────────────────────────────────────────
  { id: 'microsoft/phi-4',                      label: 'Phi-4',              note: 'Microsoft · compact · fast' },
];

export default function HomePage() {
  const [prompt, setPrompt]             = useState('');
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string } | null>(null);
  const [model, setModel]               = useState(MODELS[0].id);
  const { job, submit, isLoading }      = useAutoEngineerJob();
  const { user, loading, login, logout } = useAuth();

  const handleSubmit = () => {
    if (prompt.trim().length >= 10) submit(prompt.trim(), selectedRepo ?? undefined, model);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">AutoEngineer</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Autonomous AI Software Engineer</p>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Describe a project and AutoEngineer will plan, generate, debug, and push it to your GitHub — automatically.
          </p>
          <button
            onClick={login}
            className="flex items-center gap-3 w-full justify-center px-5 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Login with GitHub
          </button>
          <p className="text-xs text-[var(--text-muted)]">
            We request <code className="text-brand">repo</code> scope to read and push to your repositories.
          </p>
        </div>
      </main>
    );
  }

  // ── Main app (authenticated) ───────────────────────────────────────────────
  return (
    <main className="flex flex-col min-h-screen p-6 md:p-10 gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white tracking-tight">AutoEngineer</h1>
          <p className="text-xs text-[var(--text-muted)]">Autonomous AI Software Engineer</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)] font-mono">{user.githubUsername}</span>
          <button
            onClick={logout}
            className="text-xs text-[var(--text-muted)] hover:text-white transition-colors px-2 py-1 rounded border border-[var(--border)] hover:border-brand/40"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Two-column layout: prompt on left, repo browser on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Left: Prompt + status + logs ── */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest">
              Describe your project
            </h2>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />

            {/* Target repo indicator */}
            {selectedRepo && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="text-green-400">✓</span>
                Committing to
                <span className="font-mono text-white">{selectedRepo.owner}/{selectedRepo.repo}</span>
              </div>
            )}

            {/* Model selector */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border)]">
              <span className="text-xs text-[var(--text-muted)] shrink-0 font-medium">Generation model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-white outline-none disabled:opacity-40 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#1a1a2e]">{m.label} — {m.note}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--text-muted)]">{prompt.length}/4000 characters</p>
              <button
                onClick={handleSubmit}
                disabled={isLoading || prompt.trim().length < 10}
                className="px-5 py-2 rounded-lg bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                {isLoading ? 'Generating…' : selectedRepo ? 'Commit to Repo' : 'Generate Project'}
              </button>
            </div>
          </section>

          {/* Status + GitHub link */}
          {job && (
            <section className="flex items-center gap-4">
              <StatusBadge status={job.status} />
              {job.githubUrl && (
                <a
                  href={job.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand text-sm underline underline-offset-4 hover:text-brand-light transition-colors"
                >
                  View on GitHub →
                </a>
              )}
              <span className="text-xs text-[var(--text-muted)] ml-auto font-mono">{job.requestId}</span>
            </section>
          )}

          {/* Tasks + Logs */}
          {job && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-1">
                <TaskList requestId={job.requestId} />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                <LogConsole requestId={job.requestId} />
              </div>
            </div>
          )}

          {!job && (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] text-sm">
              Enter a project description above to get started.
            </div>
          )}
        </div>

        {/* ── Right: Repo browser ── */}
        <div className="lg:col-span-2">
          <section className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 flex flex-col gap-4 sticky top-6">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                GitHub Repositories
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Click a repo for an AI description. Select one to commit there instead of creating a new repo.
              </p>
            </div>
            <RepoList selectedRepo={selectedRepo} onSelect={setSelectedRepo} />
          </section>
        </div>
      </div>
    </main>
  );
}
