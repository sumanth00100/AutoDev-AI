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
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit();
      }}
      disabled={disabled}
      rows={5}
      placeholder={
        'Describe the project you want to build.\n\nExamples:\n• A REST API for a todo app with PostgreSQL, JWT auth, and Swagger docs\n• A Python CLI that scrapes Hacker News top stories and saves them to SQLite\n• A React dashboard showing real-time crypto prices with WebSocket updates'
      }
      className="
        w-full resize-none rounded-xl border border-[var(--border)]
        bg-[var(--bg-secondary)] text-[var(--text-primary)]
        placeholder-[var(--text-muted)] p-4 text-sm leading-relaxed
        focus:outline-none focus:border-brand transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    />
  );
}
