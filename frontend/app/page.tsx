'use client';

import { useState } from 'react';
import { PromptInput }        from '@/components/PromptInput';
import { StatusBadge }        from '@/components/StatusBadge';
import { LogConsole }         from '@/components/LogConsole';
import { TaskList }           from '@/components/TaskList';
import { RepoList }           from '@/components/RepoList';
import { useAutoEngineerJob } from '@/hooks/useAutoEngineerJob';
import { useAuth }            from '@/hooks/useAuth';

const MODELS = [
  // ── OpenAI ───────────────────────────────────────────────
  { id: 'openai/gpt-4o',                               label: 'GPT-4o',           note: 'OpenAI · default · fast' },
  { id: 'openai/gpt-4o-mini',                          label: 'GPT-4o mini',      note: 'OpenAI · fastest · lightweight' },
  { id: 'openai/gpt-4.1',                              label: 'GPT-4.1',          note: 'OpenAI · versatile' },
  { id: 'openai/gpt-4.1-mini',                         label: 'GPT-4.1 mini',     note: 'OpenAI · fast' },
  { id: 'openai/gpt-5',                                label: 'GPT-5',            note: 'OpenAI · highly intelligent' },
  { id: 'openai/gpt-5-mini',                           label: 'GPT-5 mini',       note: 'OpenAI · fast & cost-efficient' },
  { id: 'openai/o3',                                   label: 'o3',               note: 'OpenAI · reasoning · powerful' },
  { id: 'openai/o3-mini',                              label: 'o3-mini',          note: 'OpenAI · reasoning · fast' },
  { id: 'openai/o4-mini',                              label: 'o4-mini',          note: 'OpenAI · reasoning · latest' },
  // ── Meta / Llama ─────────────────────────────────────────
  { id: 'meta/meta-llama-3.1-405b-instruct',           label: 'Llama 3.1 405B',  note: 'Meta · open · very capable' },
  { id: 'meta/llama-3.3-70b-instruct',                 label: 'Llama 3.3 70B',   note: 'Meta · open · balanced' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct-fp8', label: 'Llama 4 Maverick',note: 'Meta · latest · multimodal' },
  // ── DeepSeek ─────────────────────────────────────────────
  { id: 'deepseek/deepseek-r1',                        label: 'DeepSeek R1',      note: 'DeepSeek · reasoning · open' },
  { id: 'deepseek/deepseek-v3-0324',                   label: 'DeepSeek V3',      note: 'DeepSeek · versatile' },
  // ── Mistral ──────────────────────────────────────────────
  { id: 'mistral-ai/codestral-2501',                   label: 'Codestral',        note: 'Mistral · code-specialized' },
  { id: 'mistral-ai/mistral-medium-2505',              label: 'Mistral Medium',   note: 'Mistral · balanced' },
  // ── xAI ──────────────────────────────────────────────────
  { id: 'xai/grok-3',                                  label: 'Grok 3',           note: 'xAI · versatile' },
  { id: 'xai/grok-3-mini',                             label: 'Grok 3 mini',      note: 'xAI · fast' },
  // ── Microsoft ────────────────────────────────────────────
  { id: 'microsoft/phi-4',                             label: 'Phi-4',            note: 'Microsoft · compact · fast' },
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

  /* ── Auth loading ──────────────────────────────────────────────── */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--text-muted)] font-mono tracking-wide">Initialising…</span>
        </div>
      </main>
    );
  }

  /* ── Login screen ──────────────────────────────────────────────── */
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="animate-fade-up flex flex-col items-center gap-8 max-w-lg w-full text-center">

          {/* Event badge */}
          <div className="chip">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Autonomous AI Software Engineer
          </div>

          {/* Logo mark */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center shadow-glow">
              <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-brand/20 blur-2xl animate-glow-pulse -z-10" />
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black text-gradient tracking-tight leading-none">
              AutoEngineer
            </h1>
            <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-sm mx-auto">
              Describe any project — AI plans, writes, and ships production-ready code to GitHub automatically.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            {['Plan & Architect', 'Generate Code', 'Push to GitHub', 'Any AI Model'].map(f => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]">
                {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={login}
            className="btn-primary flex items-center gap-3 w-full justify-center px-6 py-4 text-sm font-semibold"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <p className="text-xs text-[var(--text-muted)]">
            Requires <span className="text-brand-light font-mono bg-[var(--bg-card)] px-1.5 py-0.5 rounded">repo</span> scope · No extra API keys needed
          </p>
        </div>
      </main>
    );
  }

  /* ── Main app ──────────────────────────────────────────────────── */
  return (
    <main className="flex flex-col min-h-screen p-5 md:p-8 gap-6 max-w-[1440px] mx-auto w-full animate-fade-up">

      {/* ── Header ── */}
      <header className="flex items-center gap-4 py-1">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center shadow-glow-sm">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-base font-black text-gradient tracking-tight">AutoEngineer</h1>
            <p className="section-label">Autonomous AI Software Engineer</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model indicator pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span className="text-[var(--text-muted)]">
              {MODELS.find(m => m.id === model)?.label ?? model}
            </span>
          </div>
          <span className="hidden sm:block text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-card)] border border-[var(--border)] px-3 py-1.5 rounded-lg">
            {user.githubUsername}
          </span>
          <button onClick={logout} className="btn-outline text-xs px-3 py-1.5">
            Sign out
          </button>
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1">

        {/* ── Left: Prompt + output ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Prompt card */}
          <section className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="accent-line" />
              <h2 className="section-label">Describe your project</h2>
            </div>

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />

            {/* Target repo indicator */}
            {selectedRepo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/5 border border-[var(--border-hi)] text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-[var(--text-muted)]">Committing to</span>
                <span className="font-mono text-brand-light">{selectedRepo.owner}/{selectedRepo.repo}</span>
              </div>
            )}

            {/* Model selector */}
            <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border)] hover:border-[var(--border-hi)] transition-colors">
              <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
              <span className="text-xs text-[var(--text-muted)] shrink-0">Generation model</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-white outline-none disabled:opacity-40 cursor-pointer"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#0c0c1a]">
                    {m.label} — {m.note}
                  </option>
                ))}
              </select>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-muted)] font-mono">{prompt.length}/4000</p>
              <button
                onClick={handleSubmit}
                disabled={isLoading || prompt.trim().length < 10}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </span>
                ) : selectedRepo ? 'Commit to Repo' : 'Generate Project'}
              </button>
            </div>
          </section>

          {/* Status bar */}
          {job && (
            <section className="flex items-center gap-3 px-1">
              <StatusBadge status={job.status} />
              {job.githubUrl && (
                <a
                  href={job.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-light text-sm hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                >
                  View on GitHub
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
              <span className="text-[10px] text-[var(--text-muted)] ml-auto font-mono opacity-50">{job.requestId}</span>
            </section>
          )}

          {/* Tasks + Logs */}
          {job && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
              <div className="lg:col-span-1">
                <TaskList requestId={job.requestId} />
              </div>
              <div className="lg:col-span-2 flex flex-col">
                <LogConsole requestId={job.requestId} />
              </div>
            </div>
          )}

          {!job && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-brand/10 blur-xl animate-glow-pulse" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Ready to engineer</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Describe a project above and hit Generate.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Repo browser ── */}
        <div className="lg:col-span-2">
          <section className="glass-card rounded-2xl p-5 flex flex-col gap-4 sticky top-6">
            <div className="flex items-center gap-2.5">
              <div className="accent-line" />
              <div>
                <h2 className="section-label">GitHub Repositories</h2>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 opacity-70">
                  Click for AI description · Select to commit there
                </p>
              </div>
            </div>
            <RepoList selectedRepo={selectedRepo} onSelect={setSelectedRepo} />
          </section>
        </div>
      </div>
    </main>
  );
}
