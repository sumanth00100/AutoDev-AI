'use client';

import { useState, useEffect } from 'react';
import { authHeaders } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface Repo {
  id:          number;
  name:        string;
  fullName:    string;
  owner:       string;
  description: string | null;
  language:    string | null;
  url:         string;
  updatedAt:   string | null;
  isPrivate:   boolean;
  stars:       number;
}

export function useRepos() {
  const [repos, setRepos]     = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/repos`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch repos: ${r.status}`);
        return r.json();
      })
      .then(setRepos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  return { repos, loading, error, refresh };
}
