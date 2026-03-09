'use client';

import { useState } from 'react';
import { PromptInput }        from '@/components/PromptInput';
import { StatusBadge }        from '@/components/StatusBadge';
import { LogConsole }         from '@/components/LogConsole';
import { TaskList }           from '@/components/TaskList';
import { RepoList }           from '@/components/RepoList';
import { ModelSelector }      from '@/components/ModelSelector';
import { Tilt3D }             from '@/components/Tilt3D';
import { useAutoEngineerJob } from '@/hooks/useAutoEngineerJob';
import { useAuth }            from '@/hooks/useAuth';

const MODELS = [
  { id: 'openai/gpt-4o',                               label: 'GPT-4o',            note: 'OpenAI · default · fast',          group: 'OpenAI' },
  { id: 'openai/gpt-4o-mini',                          label: 'GPT-4o mini',       note: 'OpenAI · fastest · lightweight',   group: 'OpenAI' },
  { id: 'openai/gpt-4.1',                              label: 'GPT-4.1',           note: 'OpenAI · versatile',               group: 'OpenAI' },
  { id: 'openai/gpt-4.1-mini',                         label: 'GPT-4.1 mini',      note: 'OpenAI · fast',                    group: 'OpenAI' },
  { id: 'openai/gpt-5',                                label: 'GPT-5',             note: 'OpenAI · highly intelligent',      group: 'OpenAI' },
  { id: 'openai/o3',                                   label: 'o3',                note: 'OpenAI · reasoning · powerful',    group: 'OpenAI' },
  { id: 'openai/o4-mini',                              label: 'o4-mini',           note: 'OpenAI · reasoning · latest',      group: 'OpenAI' },
  { id: 'meta/meta-llama-3.1-405b-instruct',           label: 'Llama 3.1 405B',   note: 'Meta · open · very capable',       group: 'Meta' },
  { id: 'meta/llama-3.3-70b-instruct',                 label: 'Llama 3.3 70B',    note: 'Meta · open · balanced',           group: 'Meta' },
  { id: 'meta/llama-4-maverick-17b-128e-instruct-fp8', label: 'Llama 4 Maverick', note: 'Meta · latest · multimodal',       group: 'Meta' },
  { id: 'deepseek/deepseek-r1',                        label: 'DeepSeek R1',       note: 'DeepSeek · reasoning · open',      group: 'DeepSeek' },
  { id: 'deepseek/deepseek-v3-0324',                   label: 'DeepSeek V3',       note: 'DeepSeek · versatile',             group: 'DeepSeek' },
  { id: 'mistral-ai/codestral-2501',                   label: 'Codestral',         note: 'Mistral · code-specialized',       group: 'Mistral' },
  { id: 'mistral-ai/mistral-medium-2505',              label: 'Mistral Medium',    note: 'Mistral · balanced',               group: 'Mistral' },
  { id: 'xai/grok-3',                                  label: 'Grok 3',            note: 'xAI · versatile',                  group: 'xAI' },
  { id: 'xai/grok-3-mini',                             label: 'Grok 3 mini',       note: 'xAI · fast',                       group: 'xAI' },
  { id: 'microsoft/phi-4',                             label: 'Phi-4',             note: 'Microsoft · compact · fast',       group: 'Microsoft' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
    title: 'AI Planning',
    desc: 'Breaks your idea into structured tasks before writing a single line of code.',
    color: '#6366f1',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: 'Code Generation',
    desc: 'Produces production-ready files across any stack using frontier AI models.',
    color: '#8b5cf6',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Auto-Push',
    desc: 'Commits and pushes directly to your GitHub repo — no manual steps.',
    color: '#22d3ee',
  },
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

  const activeModel = MODELS.find(m => m.id === model);

  /* ── Auth loading ──────────────────────────────────────────────────────── */
  if (loading) return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-brand/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-brand border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <span className="text-sm text-[var(--text-2)] font-mono tracking-widest">INITIALISING</span>
      </div>
    </main>
  );

  /* ── Login screen ──────────────────────────────────────────────────────── */
  if (!user) return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-center gap-10 max-w-xl w-full text-center">

        {/* Badge */}
        <div className="chip animate-fade-up stagger-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
          Autonomous AI Software Engineer
        </div>

        {/* 3D floating logo */}
        <div className="animate-fade-up stagger-2">
          <Tilt3D className="relative inline-flex items-center justify-center" intensity={12}>
            {/* Outer spinning gradient ring */}
            <div className="absolute w-32 h-32 rounded-full animate-ring-slow"
              style={{ background: 'conic-gradient(from 0deg, transparent 65%, rgba(99,102,241,0.8) 80%, rgba(139,92,246,0.6) 90%, transparent 100%)' }}
            />
            {/* Inner counter-spinning ring */}
            <div className="absolute w-24 h-24 rounded-full animate-ring-reverse"
              style={{ background: 'conic-gradient(from 180deg, transparent 70%, rgba(34,211,238,0.5) 85%, transparent 100%)' }}
            />
            {/* Core */}
            <div className="relative w-20 h-20 rounded-2xl gradient-border flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
              <svg className="w-9 h-9" style={{ color: '#a5b4fc' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
            {/* Glow behind */}
            <div className="absolute w-28 h-28 rounded-full bg-brand/20 blur-2xl animate-glow-breathe -z-10" />
          </Tilt3D>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3 animate-fade-up stagger-3">
          <h1 className="font-display text-6xl font-black text-gradient leading-none tracking-tight">
            AutoEngineer
          </h1>
          <p className="text-[var(--text-2)] text-lg leading-relaxed max-w-md mx-auto">
            Describe any project. AI plans, codes, and ships it to GitHub — completely autonomously.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 w-full animate-fade-up stagger-4">
          {FEATURES.map((f) => (
            <Tilt3D key={f.title} intensity={10}>
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-3 text-left h-full">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}35`, color: f.color }}>
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-1)]">{f.title}</p>
                  <p className="text-xs text-[var(--text-2)] mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </Tilt3D>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full animate-fade-up stagger-5">
          <button onClick={login} className="btn-primary flex items-center gap-3 w-full justify-center px-6 py-4 text-[15px]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
          <p className="text-xs text-[var(--text-3)]">
            Requires{' '}
            <code className="text-[var(--brand-light)] bg-white/5 px-1.5 py-0.5 rounded text-[11px]">repo</code>
            {' '}scope · Uses GitHub Models — no extra API keys
          </p>
        </div>

      </div>
    </main>
  );

  /* ── Main app ──────────────────────────────────────────────────────────── */
  return (
    <main className="flex flex-col min-h-screen p-5 md:p-8 gap-6 max-w-[1440px] mx-auto w-full animate-fade-up">

      {/* ── Header ── */}
      <header className="glass-card rounded-2xl px-5 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-xl gradient-border flex items-center justify-center"
              style={{ boxShadow: '0 0 16px rgba(99,102,241,0.25)' }}>
              <svg className="w-4.5 h-4.5 text-[var(--brand-light)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="font-display text-[15px] font-bold text-gradient leading-none">AutoEngineer</h1>
            <p className="label mt-0.5">Autonomous AI Software Engineer</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Active model pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
            <span className="text-[var(--text-2)]">{activeModel?.label ?? model}</span>
          </div>
          {/* User */}
          <span className="hidden sm:block text-xs text-[var(--text-2)] font-mono bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-xl">
            {user.githubUsername}
          </span>
          <button onClick={logout} className="btn-outline text-xs px-3 py-1.5">Sign out</button>
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1">

        {/* ── Left column ── */}
        <div className="lg:col-span-3 flex flex-col gap-5">

          {/* Prompt card */}
          <section className="glass-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="accent-line" />
              <h2 className="font-display text-[15px] font-bold text-gradient leading-none">What do you want to build?</h2>
            </div>

            <PromptInput value={prompt} onChange={setPrompt} onSubmit={handleSubmit} disabled={isLoading} />

            {/* Target repo */}
            {selectedRepo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl gradient-border text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                <span className="text-[var(--text-2)]">Committing to</span>
                <span className="font-mono text-[var(--brand-light)]">{selectedRepo.owner}/{selectedRepo.repo}</span>
              </div>
            )}

            {/* Model selector */}
            <ModelSelector models={MODELS} value={model} onChange={setModel} disabled={isLoading} />

            {/* Submit row */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-3)] font-mono tabular-nums">{prompt.length} / 4000</span>
              <button
                onClick={handleSubmit}
                disabled={isLoading || prompt.trim().length < 10}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating…
                  </span>
                ) : selectedRepo ? 'Commit to Repo' : 'Generate Project'}
              </button>
            </div>
          </section>

          {/* Status */}
          {job && (
            <div className="flex items-center gap-3 px-1">
              <StatusBadge status={job.status} />
              {job.githubUrl && (
                <a href={job.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[var(--brand-light)] hover:text-white transition-colors flex items-center gap-1.5 font-medium">
                  View on GitHub
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
              <span className="ml-auto text-[10px] text-[var(--text-3)] font-mono">{job.requestId}</span>
            </div>
          )}

          {/* Tasks + Logs */}
          {job ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
              <div className="lg:col-span-1"><TaskList requestId={job.requestId} /></div>
              <div className="lg:col-span-2 flex flex-col"><LogConsole requestId={job.requestId} /></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 py-24">
              <Tilt3D intensity={8}>
                <div className="relative w-16 h-16">
                  {/* Spinning ring */}
                  <div className="absolute inset-0 rounded-2xl animate-ring-slow"
                    style={{ background: 'conic-gradient(from 0deg, transparent 60%, rgba(99,102,241,0.6) 80%, transparent 100%)' }} />
                  <div className="absolute inset-[3px] rounded-xl glass-card flex items-center justify-center">
                    <svg className="w-7 h-7 text-[var(--text-2)]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-brand/10 blur-xl animate-glow-breathe -z-10" />
                </div>
              </Tilt3D>
              <div className="text-center">
                <p className="font-display text-base font-semibold text-[var(--text-1)]">Ready to engineer</p>
                <p className="text-sm text-[var(--text-2)] mt-1">Describe a project above and hit Generate.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Repos ── */}
        <div className="lg:col-span-2">
          <section className="glass-card rounded-2xl p-5 flex flex-col gap-4 sticky top-6">
            <div className="flex items-center gap-2.5">
              <div className="accent-line" />
              <div>
                <h2 className="font-display text-[15px] font-bold text-gradient leading-none">GitHub Repositories</h2>
                <p className="text-[11px] text-[var(--text-3)] mt-0.5">Click for AI description · Select to commit</p>
              </div>
            </div>
            <RepoList selectedRepo={selectedRepo} onSelect={setSelectedRepo} />
          </section>
        </div>

      </div>
    </main>
  );
}
