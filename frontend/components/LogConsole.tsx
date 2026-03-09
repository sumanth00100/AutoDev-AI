'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

interface LogLine { message: string; level: string; ts: string; }

export function LogConsole({ requestId }: { requestId: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const bottomRef         = useRef<HTMLDivElement>(null);
  const socketRef         = useRef<WebSocket | null>(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL!;
    fetch(`${api}/logs/${requestId}`)
      .then(r => r.json())
      .then((data: { message: string; level: string; created_at: string }[]) =>
        setLines(data.map(l => ({ message: l.message, level: l.level, ts: l.created_at })))
      ).catch(() => {});
  }, [requestId]);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/logs/${requestId}`);
    socketRef.current = ws;
    ws.onmessage = evt => {
      try { setLines(prev => [...prev, JSON.parse(evt.data)]); } catch {}
    };
    return () => ws.close();
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="glass-card flex flex-col h-full min-h-[320px] rounded-2xl overflow-hidden">

      {/* Terminal titlebar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)]"
        style={{ background: 'rgba(6,6,26,0.6)' }}>
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-default" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70 hover:bg-amber-500 transition-colors cursor-default" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70 hover:bg-emerald-500 transition-colors cursor-default" />
        </div>
        <span className="flex-1 text-center text-[11px] text-[var(--text-3)] font-mono select-none tracking-wide">
          autoengineer — live logs
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
          <span className="text-[10px] font-mono text-[var(--text-3)] tabular-nums">{lines.length} lines</span>
        </div>
      </div>

      {/* Log body with scanlines */}
      <div className="scanlines flex-1 overflow-y-auto p-4 font-mono text-[11px] leading-6 space-y-[1px]"
        style={{ background: 'rgba(3,3,15,0.7)' }}>
        {/* Prompt line */}
        <div className="flex gap-2 mb-2 text-[var(--text-3)]">
          <span className="text-brand select-none">❯</span>
          <span>autoengineer run {requestId.slice(0, 8)}…</span>
        </div>

        {lines.length === 0 && (
          <div className="flex items-center gap-2 text-[var(--text-3)]">
            <span className="w-2.5 h-2.5 rounded-full border border-brand/40 border-t-transparent animate-spin" />
            <span>Waiting for execution logs…</span>
          </div>
        )}

        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 group hover:bg-white/[0.025] rounded px-1 -mx-1 transition-colors">
            <span className="text-[var(--text-3)] shrink-0 select-none opacity-40 tabular-nums">
              {new Date(line.ts).toLocaleTimeString('en-US', { hour12: false })}
            </span>
            <span className="text-[var(--text-3)] select-none opacity-30 shrink-0">│</span>
            <span className={clsx({
              'log-info':  line.level === 'info',
              'log-warn':  line.level === 'warn',
              'log-error': line.level === 'error',
              'log-debug': line.level === 'debug',
            })}>
              {line.message}
            </span>
          </div>
        ))}

        {/* Blinking cursor at bottom */}
        <div className="flex gap-2 items-center mt-1">
          <span className="text-brand select-none opacity-60">❯</span>
          <span className="w-2 h-3.5 bg-brand/60 rounded-sm animate-pulse" />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
