import React from 'react';
import { Trash2, Copy, Download, ChevronUp, ScrollText } from 'lucide-react';
import { useLogs } from '../context/LogContext';
import { usePrefs } from '../context/PrefsContext';
import { LogEntry } from '../types';
import { IconButton, cx } from './ui';

const levelDot: Record<LogEntry['level'], string> = {
  info: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};
const levelText: Record<LogEntry['level'], string> = {
  info: 'text-fg/80',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
};

export function LogPanel() {
  const { logs, clearLogs, copyLogs } = useLogs();
  const { logOpen: open, setLogOpen } = usePrefs();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const last = logs[logs.length - 1];
  const errors = logs.filter(l => l.level === 'error').length;

  React.useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs, open]);

  const exportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.tool} | ${l.action} | ${l.result}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samirtechtools-registro-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="shrink-0 border-t border-line bg-surface">
      {/* Barra */}
      <div className="h-9 flex items-center gap-3 pl-3.5 pr-2">
        <button onClick={() => setLogOpen(!open)} className="flex items-center gap-2 text-[12px] font-medium text-muted hover:text-fg shrink-0">
          <ScrollText size={14} />
          Registro
          <span className="tabular-nums text-[10.5px] px-1.5 rounded-md bg-surface-2 text-subtle">{logs.length}</span>
          {errors > 0 && <span className="tabular-nums text-[10.5px] px-1.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400">{errors} error{errors > 1 ? 'es' : ''}</span>}
        </button>

        <button onClick={() => setLogOpen(!open)} className="flex-1 min-w-0 flex items-center gap-2 text-[12px] text-left">
          {last && !open && (
            <>
              <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', levelDot[last.level])} />
              <span className="text-subtle font-mono text-[11px] shrink-0">{last.timestamp}</span>
              <span className="text-muted shrink-0">{last.tool}</span>
              <span className="text-subtle shrink-0">·</span>
              <span className={cx('truncate', levelText[last.level])}>{last.action} — {last.result}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton label="Copiar registro" onClick={copyLogs} className="w-7 h-7"><Copy size={13} /></IconButton>
          <IconButton label="Exportar a TXT" onClick={exportLogs} className="w-7 h-7"><Download size={13} /></IconButton>
          <IconButton label="Limpiar registro" onClick={clearLogs} className="w-7 h-7 hover:!text-red-500"><Trash2 size={13} /></IconButton>
          <IconButton label={open ? 'Ocultar registro' : 'Mostrar registro'} onClick={() => setLogOpen(!open)} className="w-7 h-7">
            <ChevronUp size={15} className={cx('transition-transform', open && 'rotate-180')} />
          </IconButton>
        </div>
      </div>

      {/* Lista */}
      {open && (
        <div ref={scrollRef} className="h-[200px] overflow-y-auto border-t border-line px-3.5 py-2 font-mono text-[11.5px] animate-fade-in">
          {logs.length === 0 ? (
            <div className="h-full grid place-items-center text-subtle font-sans text-[12px]">Sin registros todavía</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 py-[3px] select-text">
                <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', levelDot[log.level])} />
                <span className="text-subtle shrink-0">{log.timestamp}</span>
                <span className="text-muted shrink-0 w-24 truncate">{log.tool}</span>
                <span className="text-fg/90 shrink-0 w-40 truncate">{log.action}</span>
                <span className={cx('flex-1 truncate', levelText[log.level])} title={log.result}>{log.result}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
