'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

const ICONS = {
  pending: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  ),
  running: (
    <svg className="w-3.5 h-3.5 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  completed: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
    </svg>
  ),
  failed: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
    </svg>
  ),
};

export function TaskList({ requestId }: { requestId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/tasks/${requestId}`);
        if (!res.ok || cancelled) return;
        setTasks(await res.json());
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [requestId]);

  const done  = tasks.filter(t => t.status === 'completed').length;
  const pct   = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="accent-line" />
        <h3 className="label flex-1">Planned Tasks</h3>
        {tasks.length > 0 && (
          <span className="text-[10px] font-mono text-[var(--text-3)] bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full tabular-nums">
            {done}/{tasks.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 8px rgba(99,102,241,0.6)',
            }}
          />
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="flex items-center gap-2.5 text-xs text-[var(--text-2)]">
          <span className="w-3.5 h-3.5 rounded-full border border-brand/40 border-t-transparent animate-spin" />
          Planning tasks…
        </div>
      ) : (
        <ul className="space-y-1.5 flex-1 overflow-y-auto">
          {tasks.map((task, i) => (
            <li
              key={task.id}
              className={clsx(
                'flex gap-3 items-start p-2.5 rounded-xl border text-xs transition-all duration-300',
                task.status === 'running'   && 'border-brand/25 bg-brand/[0.05]',
                task.status === 'completed' && 'border-transparent opacity-40',
                task.status === 'failed'    && 'border-red-500/25 bg-red-500/[0.05]',
                task.status === 'pending'   && 'border-transparent',
              )}
            >
              <span className={clsx('shrink-0 mt-0.5', {
                'text-[var(--text-3)]': task.status === 'pending',
                'text-brand':          task.status === 'running',
                'text-emerald-400':    task.status === 'completed',
                'text-red-400':        task.status === 'failed',
              })}>
                {ICONS[task.status]}
              </span>
              <span className={clsx('leading-[1.5]', {
                'text-[var(--text-3)]':                    task.status === 'pending',
                'text-[var(--text-1)] font-medium':        task.status === 'running',
                'text-[var(--text-3)] line-through':       task.status === 'completed',
                'text-red-400':                            task.status === 'failed',
              })}>
                <span className="font-mono text-[var(--text-3)] opacity-50 mr-1.5">{i + 1}.</span>
                {task.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
