'use client';

import clsx from 'clsx';
import type { JobStatus } from '@/hooks/useAutoEngineerJob';

const CONFIG: Record<JobStatus, { label: string; dot: string; text: string; border: string; bg: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',                  text: 'text-amber-300',  border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
  running:   { label: 'Running',   dot: 'bg-brand animate-pulse-fast',   text: 'text-brand-light', border: 'border-brand/30',    bg: 'bg-brand/5' },
  completed: { label: 'Completed', dot: 'bg-brand',                      text: 'text-brand-light', border: 'border-brand/30',    bg: 'bg-brand/5' },
  failed:    { label: 'Failed',    dot: 'bg-red-400',                    text: 'text-red-300',     border: 'border-red-500/30',  bg: 'bg-red-500/5' },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const { label, dot, text, border, bg } = CONFIG[status];
  return (
    <span className={clsx(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border tracking-wide',
      text, border, bg
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />
      {label}
    </span>
  );
}
