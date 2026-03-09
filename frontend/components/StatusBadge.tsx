'use client';

import clsx from 'clsx';
import type { JobStatus } from '@/hooks/useAutoEngineerJob';

const CONFIG: Record<JobStatus, { label: string; dot: string; ring: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-yellow-400', ring: 'ring-yellow-400/30' },
  running:   { label: 'Running',   dot: 'bg-blue-400 animate-pulse-fast', ring: 'ring-blue-400/30' },
  completed: { label: 'Completed', dot: 'bg-green-400', ring: 'ring-green-400/30' },
  failed:    { label: 'Failed',    dot: 'bg-red-400',   ring: 'ring-red-400/30' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const { label, dot, ring } = CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ring-1',
        'bg-[var(--bg-card)] text-[var(--text-primary)]',
        ring
      )}
    >
      <span className={clsx('w-2 h-2 rounded-full', dot)} />
      {label}
    </span>
  );
}
