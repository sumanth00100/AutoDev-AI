'use client';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function PromptInput({ value, onChange, onSubmit, disabled }: Props) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit(); }}
      disabled={disabled}
      rows={5}
      placeholder={"Describe the project you want to build.\n\nExamples:\n• A REST API for a todo app with PostgreSQL and JWT auth\n• A React dashboard showing real-time crypto prices\n• A Python CLI that scrapes Hacker News top stories"}
      className="
        w-full resize-none rounded-xl
        border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]
        text-[var(--text-1)] font-sans placeholder-[var(--text-3)]
        p-4 text-sm leading-relaxed tracking-[0.01em]
        input-glow transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
      "
    />
  );
}
