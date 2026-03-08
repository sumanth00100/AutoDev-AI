'use client';

import { useState } from 'react';
import { PromptInput }   from '@/components/PromptInput';
import { StatusBadge }   from '@/components/StatusBadge';
import { LogConsole }    from '@/components/LogConsole';
import { TaskList }      from '@/components/TaskList';
import { RepoList }      from '@/components/RepoList';
import { useAutoDevJob } from '@/hooks/useAutoDevJob';

export default function HomePage() {
  const [prompt, setPrompt]             = useState('');
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; repo: string } | null>(null);
  const { job, submit, isLoading }      = useAutoDevJob();

  const handleSubmit = () => {
    if (prompt.trim().length >= 10) submit(prompt.trim(), selectedRepo ?? undefined);
  };

  return (
    <main className="flex flex-col min-h-screen p-6 md:p-10 gap-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AutoDev AI</h1>
          <p className="text-xs text-[var(--text-muted)]">Autonomous AI Software Engineer</p>
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
