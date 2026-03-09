'use client';

import { useState } from 'react';
import { useRepos, Repo } from '@/hooks/useRepos';
import { authHeaders } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Props {
  selectedRepo: { owner: string; repo: string } | null;
  onSelect: (repo: { owner: string; repo: string } | null) => void;
}

export function RepoList({ selectedRepo, onSelect }: Props) {
  const { repos, loading, error, refresh } = useRepos();
  const [search, setSearch]               = useState('');
  const [describing, setDescribing]       = useState<string | null>(null);
  const [descriptions, setDescriptions]   = useState<Record<string, string>>({});
  const [expanded, setExpanded]           = useState<string | null>(null);

  const filtered = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleRepoClick(repo: Repo) {
    const key = repo.fullName;
    setExpanded(prev => prev === key ? null : key);
    if (!descriptions[key] && describing !== key) {
      setDescribing(key);
      try {
        const res  = await fetch(`${API_URL}/repos/${repo.owner}/${repo.name}/describe`, { headers: authHeaders() });
        const data = await res.json();
        setDescriptions(prev => ({ ...prev, [key]: data.description }));
      } catch {
        setDescriptions(prev => ({ ...prev, [key]: 'Could not load description.' }));
      } finally {
        setDescribing(null);
      }
    }
  }

  function handleSelect(repo: Repo) {
    const val = { owner: repo.owner, repo: repo.name };
    const isSel = selectedRepo?.repo === repo.name && selectedRepo?.owner === repo.owner;
    onSelect(isSel ? null : val);
  }

  if (loading) return (
    <div className="flex items-center gap-2.5 text-[var(--text-2)] text-sm py-4">
      <span className="w-4 h-4 rounded-full border-2 border-brand/40 border-t-transparent animate-spin" />
      Loading repositories…
    </div>
  );

  if (error) return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-3)] pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-1)] placeholder-[var(--text-3)] input-glow transition-colors"
          />
        </div>
        <button onClick={refresh} disabled={loading} title="Refresh"
          className="btn-outline px-3 py-2 text-sm disabled:opacity-40">
          <span className={loading ? 'inline-block animate-spin' : ''}>↻</span>
        </button>
      </div>

      {/* Selected badge */}
      {selectedRepo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl gradient-border text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="font-mono text-[var(--brand-light)] truncate flex-1">{selectedRepo.owner}/{selectedRepo.repo}</span>
          <button onClick={() => onSelect(null)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors text-base leading-none ml-auto">×</button>
        </div>
      )}

      {/* Repo list */}
      <div className="flex flex-col gap-1.5 max-h-[430px] overflow-y-auto pr-0.5">
        {filtered.length === 0 && (
          <p className="text-[var(--text-3)] text-xs text-center py-8">No repositories found.</p>
        )}

        {filtered.map(repo => {
          const key      = repo.fullName;
          const isExp    = expanded === key;
          const isSel    = selectedRepo?.repo === repo.name && selectedRepo?.owner === repo.owner;
          const desc     = descriptions[key];
          const isLoading = describing === key;

          return (
            <div key={repo.id}
              className={`rounded-xl border transition-all duration-200 ${
                isSel
                  ? 'border-brand/30 bg-brand/[0.05]'
                  : 'border-[rgba(255,255,255,0.06)] bg-white/[0.02] hover:border-brand/20'
              }`}
            >
              <button onClick={() => handleRepoClick(repo)}
                className="w-full text-left px-3.5 py-2.5 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor(repo.language) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-1)] truncate">{repo.name}</p>
                  {repo.description && (
                    <p className="text-[10px] text-[var(--text-3)] truncate mt-0.5">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-[var(--text-3)]">
                  {repo.stars > 0 && (
                    <span className="flex items-center gap-0.5 text-amber-500/70">★ {repo.stars}</span>
                  )}
                  <span className={`transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>

              {isExp && (
                <div className="px-3.5 pb-3.5 border-t border-[rgba(255,255,255,0.06)] flex flex-col gap-3">
                  <div className="pt-3 text-[11px] text-[var(--text-2)] leading-relaxed">
                    {isLoading ? (
                      <span className="flex items-center gap-2 text-[var(--text-3)]">
                        <span className="w-3 h-3 rounded-full border border-brand/40 border-t-transparent animate-spin" />
                        Generating AI description…
                      </span>
                    ) : desc ?? 'No description available.'}
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={repo.url} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-[var(--text-3)] hover:text-[var(--brand-light)] transition-colors flex items-center gap-1">
                      GitHub ↗
                    </a>
                    <button onClick={() => handleSelect(repo)}
                      className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSel ? 'btn-outline' : 'btn-primary'}`}>
                      {isSel ? '✓ Selected' : 'Use this repo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function langColor(lang: string | null): string {
  const map: Record<string, string> = {
    TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572A5',
    Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', 'C++': '#f34b7d',
    CSS: '#563d7c', HTML: '#e34c26', Shell: '#89e051', Ruby: '#701516',
  };
  return lang ? (map[lang] ?? '#6366f1') : '#6366f1';
}
