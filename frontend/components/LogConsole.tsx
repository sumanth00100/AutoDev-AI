'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

interface LogLine { message: string; level: string; ts: string; }

export function LogConsole({ requestId }: { requestId: string }) {
  const [lines, setLines]   = useState<LogLine[]>([]);
  const bottomRef           = useRef<HTMLDivElement>(null);
  const socketRef           = useRef<WebSocket | null>(null);

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
    ws.onmessage = (evt) => {
      try { setLines(prev => [...prev, JSON.parse(evt.data)]); } catch {}
    };
    return () => ws.close();
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="glass-card flex flex-col h-full min-h-[320px] rounded-2xl overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-main)]">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-brand/60" />
        </div>
        <span className="text-xs text-[var(--text-muted)] ml-2 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-fast" />
          Live Execution Logs
        </span>
        <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">{lines.length} lines</span>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-6 space-y-0.5">
        {lines.length === 0 && (
          <p className="text-[var(--text-muted)] flex items-center gap-2">
            <span className="w-3 h-3 border border-brand/40 border-t-transparent rounded-full animate-spin" />
            Waiting for logs…
          </p>
        )}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1 transition-colors">
            <span className="text-[var(--text-muted)] shrink-0 select-none opacity-40">
              {new Date(line.ts).toLocaleTimeString()}
            </span>
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
