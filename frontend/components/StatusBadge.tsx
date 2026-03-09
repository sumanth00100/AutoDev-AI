'use client';

import clsx from 'clsx';
import type { JobStatus } from '@/hooks/useAutoEngineerJob';

const CONFIG: Record<JobStatus, { label: string; dot: string; text: string; bg: string; border: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400 animate-pulse-dot', text: 'text-amber-300',       bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/25' },
  running:   { label: 'Running',   dot: 'bg-brand animate-pulse-dot',     text: 'text-[var(--brand-light)]', bg: 'bg-brand/[0.07]',  border: 'border-brand/25' },
  completed: { label: 'Completed', dot: 'bg-emerald-400',                 text: 'text-emerald-300',     bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/25' },
  failed:    { label: 'Failed',    dot: 'bg-red-400',                     text: 'text-red-300',         bg: 'bg-red-500/[0.06]',  border: 'border-red-500/25' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const c = CONFIG[status];
  return (
    <span className={clsx(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border tracking-wide',
      c.text, c.bg, c.border
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}
