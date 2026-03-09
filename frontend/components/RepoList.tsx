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
    setExpanded(prev => (prev === key ? null : key));
    if (!descriptions[key] && describing !== key) {
      setDescribing(key);
      try {
        const res = await fetch(`${API_URL}/repos/${repo.owner}/${repo.name}/describe`, { headers: authHeaders() });
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
    const isSelected = selectedRepo?.repo === repo.name && selectedRepo?.owner === repo.owner;
    onSelect(isSelected ? null : val);
  }

  if (loading) return (
    <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-4">
      <span className="w-4 h-4 border-2 border-brand/50 border-t-transparent rounded-full animate-spin" />
      Loading repositories…
    </div>
  );

  if (error) return <p className="text-red-400 text-sm">{error}</p>;

  return (
    <div className="flex flex-col gap-3">
      {/* Search + Refresh */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search repositories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[var(--text-muted)] outline-none focus:border-brand/40 transition-colors"
          />
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          title="Refresh repositories"
          className="btn-outline px-3 py-2 text-sm disabled:opacity-40"
        >
          <span className={loading ? 'inline-block animate-spin' : ''}>↻</span>
        </button>
      </div>

      {/* Selected badge */}
      {selectedRepo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/5 border border-[var(--border-hi)] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span className="font-mono text-brand-light truncate">{selectedRepo.owner}/{selectedRepo.repo}</span>
          <button onClick={() => onSelect(null)} className="ml-auto text-[var(--text-muted)] hover:text-white transition-colors text-base leading-none">×</button>
        </div>
      )}

      {/* Repo list */}
      <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-[var(--text-muted)] text-xs text-center py-6">No repositories found.</p>
        )}
        {filtered.map(repo => {
          const key        = repo.fullName;
          const isExpanded = expanded === key;
          const isSelected = selectedRepo?.repo === repo.name && selectedRepo?.owner === repo.owner;
          const desc       = descriptions[key];
          const isLoading  = describing === key;

          return (
            <div
              key={repo.id}
              className={`rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'border-brand/35 bg-brand/5 shadow-glow-sm'
                  : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-brand/20'
              }`}
            >
              <button
                onClick={() => handleRepoClick(repo)}
                className="w-full text-left px-3.5 py-2.5 flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: langColor(repo.language) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{repo.name}</p>
                  {repo.description && (
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-[10px] text-[var(--text-muted)]">
                  {repo.stars > 0 && <span className="text-amber-500/70">★ {repo.stars}</span>}
                  <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3.5 pb-3 border-t border-[var(--border)] flex flex-col gap-3">
                  <div className="pt-2.5 text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border border-brand/50 border-t-transparent rounded-full animate-spin" />
                        Generating AI description…
                      </span>
                    ) : desc ?? 'No description available.'}
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[var(--text-muted)] hover:text-brand-light transition-colors flex items-center gap-1"
                    >
                      View on GitHub ↗
                    </a>
                    <button
                      onClick={() => handleSelect(repo)}
                      className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected ? 'btn-outline' : 'btn-primary'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Use this repo'}
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
  return lang ? (map[lang] ?? '#4353ff') : '#4353ff';
}
