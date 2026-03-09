'use client';

interface PromptInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, onSubmit, disabled }: PromptInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit(); }}
      disabled={disabled}
      rows={5}
      placeholder={'Describe the project you want to build.\n\nExamples:\n• A REST API for a todo app with PostgreSQL and JWT auth\n• A React dashboard showing real-time crypto prices\n• A Python CLI that scrapes Hacker News top stories'}
      className="
        w-full resize-none rounded-xl border border-[var(--border)]
        bg-[var(--bg-main)] text-[var(--text-primary)] font-sans
        placeholder-[var(--text-muted)] p-4 text-sm leading-relaxed
        focus:outline-none focus:border-brand/50 focus:shadow-glow-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    />
  );
}
