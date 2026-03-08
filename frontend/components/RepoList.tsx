'use client';

import { useState } from 'react';
import { useRepos, Repo } from '@/hooks/useRepos';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Props {
  selectedRepo: { owner: string; repo: string } | null;
  onSelect:     (repo: { owner: string; repo: string } | null) => void;
}

export function RepoList({ selectedRepo, onSelect }: Props) {
  const { repos, loading, error } = useRepos();
  const [search, setSearch]       = useState('');
  const [describing, setDescribing] = useState<string | null>(null); // fullName being described
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [expanded, setExpanded]   = useState<string | null>(null);

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  async function handleRepoClick(repo: Repo) {
    const key = repo.fullName;
    setExpanded((prev) => (prev === key ? null : key));

    // fetch AI description if not already loaded
    if (!descriptions[key] && describing !== key) {
      setDescribing(key);
      try {
        const res = await fetch(`${API_URL}/repos/${repo.owner}/${repo.name}/describe`);
        const data = await res.json();
        setDescriptions((prev) => ({ ...prev, [key]: data.description }));
      } catch {
        setDescriptions((prev) => ({ ...prev, [key]: 'Could not load description.' }));
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-4">
        <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        Loading repositories…
      </div>
    );
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Search repositories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none focus:border-brand transition-colors"
      />

      {/* Selected badge */}
      {selectedRepo && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/10 border border-brand/30 text-sm">
          <span className="text-brand font-mono">{selectedRepo.owner}/{selectedRepo.repo}</span>
          <span className="text-[var(--text-muted)] ml-auto">selected</span>
          <button onClick={() => onSelect(null)} className="text-[var(--text-muted)] hover:text-white ml-1">✕</button>
        </div>
      )}

      {/* Repo list */}
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
        {filtered.length === 0 && (
          <p className="text-[var(--text-muted)] text-sm text-center py-4">No repositories found.</p>
        )}
        {filtered.map((repo) => {
          const key        = repo.fullName;
          const isExpanded = expanded === key;
          const isSelected = selectedRepo?.repo === repo.name && selectedRepo?.owner === repo.owner;
          const desc       = descriptions[key];
          const isLoading  = describing === key;

          return (
            <div
              key={repo.id}
              className={`rounded-xl border transition-colors ${
                isSelected
                  ? 'border-brand bg-brand/10'
                  : 'border-[var(--border)] bg-[var(--bg-main)] hover:border-brand/40'
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => handleRepoClick(repo)}
                className="w-full text-left px-4 py-3 flex items-center gap-3"
              >
                {/* Language dot */}
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: langColor(repo.language) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                  {repo.description && (
                    <p className="text-xs text-[var(--text-muted)] truncate">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-xs text-[var(--text-muted)]">
                  {repo.language && <span>{repo.language}</span>}
                  {repo.stars > 0 && <span>★ {repo.stars}</span>}
                  <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>

              {/* Expanded: AI description + Use button */}
              {isExpanded && (
                <div className="px-4 pb-3 flex flex-col gap-3 border-t border-[var(--border)]">
                  <div className="pt-2 text-xs text-[var(--text-muted)] leading-relaxed">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                        Generating AI description…
                      </span>
                    ) : (
                      desc ?? 'No description available.'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand underline underline-offset-2"
                    >
                      View on GitHub ↗
                    </a>
                    <button
                      onClick={() => handleSelect(repo)}
                      className={`ml-auto px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-brand/20 text-brand border border-brand/40'
                          : 'bg-brand hover:bg-brand-dark text-white'
                      }`}
                    >
                      {isSelected ? 'Deselect' : 'Use this repo'}
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
  return lang ? (map[lang] ?? '#6b7280') : '#6b7280';
}
