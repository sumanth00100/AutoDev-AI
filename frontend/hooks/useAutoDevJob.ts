'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { authHeaders } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  requestId: string;
  status:    JobStatus;
  githubUrl: string | null;
}

export function useAutoDevJob() {
  const [job, setJob]             = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (requestId: string) => {
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/request/${requestId}`, { headers: authHeaders() });
          if (!res.ok) return;
          const data = await res.json();
          setJob({ requestId, status: data.status, githubUrl: data.github_url ?? null });
          if (data.status === 'completed' || data.status === 'failed') {
            stopPolling();
            setIsLoading(false);
          }
        } catch { /* keep polling */ }
      }, 2000);
    },
    [stopPolling]
  );

  const submit = useCallback(
    async (prompt: string, targetRepo?: { owner: string; repo: string }, model?: string) => {
      setIsLoading(true);
      setJob(null);
      stopPolling();

      try {
        const res = await fetch(`${API_URL}/generate-project`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body:    JSON.stringify({ prompt, ...(targetRepo ? { targetRepo } : {}), ...(model ? { model } : {}) }),
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const newJob: Job = { requestId: data.requestId, status: data.status, githubUrl: null };
        setJob(newJob);
        startPolling(data.requestId);
      } catch (err) {
        console.error('[useAutoDevJob] submit error', err);
        setIsLoading(false);
      }
    },
    [startPolling, stopPolling]
  );

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { job, submit, isLoading };
}
