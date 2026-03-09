'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

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

  const done = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="accent-line" />
        <h3 className="section-label flex-1">Planned Tasks</h3>
        {tasks.length > 0 && (
          <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-main)] border border-[var(--border)] px-2 py-0.5 rounded-full">
            {done}/{tasks.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500"
            style={{ width: `${(done / tasks.length) * 100}%` }}
          />
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-3 h-3 border border-brand/50 border-t-transparent rounded-full animate-spin" />
          Planning…
        </div>
      ) : (
        <ul className="space-y-1.5 flex-1 overflow-y-auto">
          {tasks.map((task, i) => (
            <li key={task.id} className={clsx(
              'flex gap-3 items-start text-xs p-2.5 rounded-lg border transition-all duration-300',
              task.status === 'running'   && 'border-brand/25 bg-brand/5',
              task.status === 'completed' && 'border-transparent opacity-45',
              task.status === 'failed'    && 'border-red-500/25 bg-red-500/5',
              task.status === 'pending'   && 'border-transparent',
            )}>
              {/* Status icon */}
              <span className={clsx('shrink-0 mt-0.5', {
                'text-[var(--text-muted)]': task.status === 'pending',
                'text-brand animate-pulse': task.status === 'running',
                'text-brand':              task.status === 'completed',
                'text-red-400':            task.status === 'failed',
              })}>
                {task.status === 'pending'   && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>}
                {task.status === 'running'   && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2 2"/></svg>}
                {task.status === 'completed' && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/></svg>}
                {task.status === 'failed'    && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>}
              </span>
              <span className={clsx('leading-4', {
                'text-[var(--text-muted)]':              task.status === 'pending',
                'text-white':                            task.status === 'running',
                'text-[var(--text-muted)] line-through': task.status === 'completed',
                'text-red-400':                          task.status === 'failed',
              })}>
                <span className="text-[var(--text-muted)] opacity-40 mr-1.5 font-mono">{i + 1}.</span>
                {task.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
