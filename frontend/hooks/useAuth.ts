'use client';

import { useState, useEffect } from 'react';
import { authHeaders } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface AuthUser {
  userId:          string;
  githubUsername:  string;
}

export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // After OAuth redirect the JWT lands in the URL fragment: /#token=<jwt>
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const token = decodeURIComponent(hash.slice('#token='.length));
      sessionStorage.setItem('autodev_token', token);
      window.history.replaceState(null, '', window.location.pathname);
    }

    const token = sessionStorage.getItem('autodev_token');
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AuthUser | null) => {
        if (data) setUser(data);
        else sessionStorage.removeItem('autodev_token');
      })
      .catch(() => sessionStorage.removeItem('autodev_token'))
      .finally(() => setLoading(false));
  }, []);

  const login  = () => { window.location.href = `${API_URL}/auth/github`; };
  const logout = () => {
    sessionStorage.removeItem('autodev_token');
    setUser(null);
  };

  return { user, loading, login, logout };
}
