'use client';

import { useState, useEffect } from 'react';

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
  const [repos, setRepos]       = useState<Repo[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/repos`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch repos: ${r.status}`);
        return r.json();
      })
      .then(setRepos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { repos, loading, error };
}
