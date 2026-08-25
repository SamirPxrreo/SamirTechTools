import React from 'react';
import { LogEntry } from '../types';
import { useLogs } from '../context/LogContext';
import { getStatusColor } from '../utils';
import { Trash2, Copy, Download } from 'lucide-react';

export function LogPanel() {
  const { logs, clearLogs, copyLogs } = useLogs();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const exportLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.tool} | ${l.action} | ${l.result}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mm-informatica-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-dark-900 border-t border-dark-700 flex flex-col" style={{ height: '180px' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-700">
        <span className="text-xs font-semibold text-dark-300 tracking-wider uppercase">Registro</span>
        <div className="flex gap-2">
          <button
            onClick={copyLogs}
            className="p-1.5 hover:bg-dark-700 rounded text-dark-400 hover:text-white transition-colors"
            title="Copiar registro"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={exportLogs}
            className="p-1.5 hover:bg-dark-700 rounded text-dark-400 hover:text-white transition-colors"
            title="Exportar a TXT"
          >
            <Download size={14} />
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 hover:bg-dark-700 rounded text-dark-400 hover:text-red-400 transition-colors"
            title="Limpiar registro"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
        {logs.length === 0 ? (
          <div className="text-dark-500 text-center py-4">Sin registros aún...</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 animate-fade-in">
              <span className="text-dark-500 flex-shrink-0">{log.timestamp}</span>
              <span className="text-dark-400 flex-shrink-0 w-24 truncate">{log.tool}</span>
              <span className="text-dark-300 flex-shrink-0 w-32 truncate">{log.action}</span>
              <span className={`flex-1 truncate ${getStatusColor(log.level)}`}>{log.result}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
