import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check, TerminalSquare } from 'lucide-react';
import { cx } from './ui';

interface ConsoleOutputProps {
  output: string;
  loading?: boolean;
  title?: string;
  className?: string;
  maxHeight?: string;
}

/** Terminal de salida. Siempre oscura (también en tema claro) para lectura cómoda. */
export function ConsoleOutput({ output, loading = false, title = 'Salida', className, maxHeight = 'max-h-72' }: ConsoleOutputProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [output]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className={cx('rounded-2xl overflow-hidden border border-black/10 dark:border-white/[0.06] bg-[rgb(var(--console))] shadow-lift animate-fade-in', className)}>
      <div className="flex items-center justify-between h-9 px-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-[12px] font-medium text-slate-300">
          <TerminalSquare size={14} className="text-slate-500" />
          {title}
          {loading && (
            <span className="inline-flex items-center gap-1.5 ml-1 text-[11px] text-amber-300/90">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-amber-400" />
              </span>
              Ejecutando
            </span>
          )}
        </div>
        {output && (
          <button onClick={copy} className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        )}
      </div>
      <div ref={ref} className={cx('p-3.5 font-mono text-[12px] leading-relaxed text-slate-300 overflow-y-auto select-text', maxHeight)}>
        {output ? (
          <pre className="whitespace-pre-wrap break-words font-mono">{output}</pre>
        ) : (
          <span className="text-slate-500">{loading ? 'Esperando salida…' : 'Sin salida.'}</span>
        )}
      </div>
    </div>
  );
}
