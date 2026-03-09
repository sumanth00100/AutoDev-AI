'use client';

import { useEffect, useRef, useState } from 'react';

interface Model {
  id: string;
  label: string;
  note: string;
  group: string;
}

interface Props {
  models: Model[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

const GROUP_COLORS: Record<string, string> = {
  OpenAI:    '#10b981',
  Meta:      '#3b82f6',
  DeepSeek:  '#f59e0b',
  Mistral:   '#ec4899',
  xAI:       '#a78bfa',
  Microsoft: '#06b6d4',
};

export function ModelSelector({ models, value, onChange, disabled }: Props) {
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const active            = models.find(m => m.id === value);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Group models */
  const groups = models.reduce<Record<string, Model[]>>((acc, m) => {
    (acc[m.group] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
          ${open
            ? 'border-[var(--border-hi)] bg-white/[0.05] shadow-[0_0_20px_rgba(99,102,241,0.12)]'
            : 'border-white/[0.07] bg-white/[0.03] hover:border-[var(--border-hi)] hover:bg-white/[0.05]'
          }
          disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {/* Spark icon */}
        <svg className="w-3.5 h-3.5 text-[var(--brand-light)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>

        {/* Label */}
        <span className="text-xs text-[var(--text-2)] shrink-0 font-medium">Model</span>

        {/* Selected */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {active && (
            <>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: GROUP_COLORS[active.group] ?? '#6366f1' }}
              />
              <span className="text-xs font-semibold text-white truncate">{active.label}</span>
              <span className="hidden sm:block text-[10px] text-[var(--text-3)] truncate">{active.note}</span>
            </>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-[var(--text-3)] shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-[rgba(99,102,241,0.2)] overflow-hidden"
          style={{
            background: 'rgba(8,8,28,0.97)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.08)',
            maxHeight: '340px',
            overflowY: 'auto',
          }}
        >
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              {/* Group header */}
              <div className="flex items-center gap-2 px-4 py-2 sticky top-0"
                style={{ background: 'rgba(8,8,28,0.97)' }}>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: GROUP_COLORS[group] ?? '#6366f1' }}
                />
                <span className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: GROUP_COLORS[group] ?? '#6366f1' }}>
                  {group}
                </span>
              </div>

              {/* Items */}
              {items.map(m => {
                const isSel = m.id === value;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onChange(m.id); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                      ${isSel
                        ? 'bg-brand/[0.12]'
                        : 'hover:bg-white/[0.04]'
                      }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: isSel ? (GROUP_COLORS[group] ?? '#6366f1') : 'rgba(255,255,255,0.15)' }}
                    />
                    <span className={`text-xs font-medium flex-1 truncate ${isSel ? 'text-white' : 'text-[var(--text-2)]'}`}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-[var(--text-3)] truncate max-w-[120px] hidden sm:block">
                      {m.note}
                    </span>
                    {isSel && (
                      <svg className="w-3 h-3 text-[var(--brand-light)] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
