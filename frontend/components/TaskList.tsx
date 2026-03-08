'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

const STATUS_ICON: Record<Task['status'], string> = {
  pending:   '○',
  running:   '◌',
  completed: '●',
  failed:    '✗',
};

const STATUS_COLOR: Record<Task['status'], string> = {
  pending:   'text-[var(--text-muted)]',
  running:   'text-blue-400',
  completed: 'text-green-400',
  failed:    'text-red-400',
};

export function TaskList({ requestId }: { requestId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/tasks/${requestId}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        setTasks(data);
      } catch {}
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [requestId]);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5 h-full">
      <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-4">
        Planned Tasks
      </h3>
      {tasks.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)]">Planning…</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li key={task.id} className="flex gap-3 items-start text-sm">
              <span className={clsx('shrink-0 font-mono text-base leading-5', STATUS_COLOR[task.status])}>
                {STATUS_ICON[task.status]}
              </span>
              <span
                className={clsx('leading-5', {
                  'text-[var(--text-muted)] line-through': task.status === 'completed',
                  'text-white':                             task.status === 'running',
                  'text-[var(--text-primary)]':             task.status === 'pending',
                  'text-red-400':                           task.status === 'failed',
                })}
              >
                <span className="text-[var(--text-muted)] mr-1">{i + 1}.</span>
                {task.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
