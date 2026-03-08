'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

interface LogLine {
  message: string;
  level: string;
  ts: string;
}

export function LogConsole({ requestId }: { requestId: string }) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const socketRef  = useRef<WebSocket | null>(null);

  // Fetch historical logs on mount
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL!;
    fetch(`${api}/logs/${requestId}`)
      .then((r) => r.json())
      .then((data: { message: string; level: string; created_at: string }[]) => {
        setLines(data.map((l) => ({ message: l.message, level: l.level, ts: l.created_at })));
      })
      .catch(() => {});
  }, [requestId]);

  // Subscribe to live updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/logs/${requestId}`);
    socketRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const line: LogLine = JSON.parse(evt.data);
        setLines((prev) => [...prev, line]);
      } catch {
        // malformed message – skip
      }
    };

    return () => {
      ws.close();
    };
  }, [requestId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="flex flex-col h-full min-h-[320px] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500 opacity-70" />
          <span className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
        </div>
        <span className="text-xs text-[var(--text-muted)] ml-2 font-mono">Live Execution Logs</span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">{lines.length} lines</span>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-6 space-y-0.5">
        {lines.length === 0 && (
          <p className="text-[var(--text-muted)]">Waiting for logs…</p>
        )}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-[var(--text-muted)] shrink-0 select-none">
              {new Date(line.ts).toLocaleTimeString()}
            </span>
            <span
              className={clsx({
                'log-info':  line.level === 'info',
                'log-warn':  line.level === 'warn',
                'log-error': line.level === 'error',
                'log-debug': line.level === 'debug',
              })}
            >
              {line.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
