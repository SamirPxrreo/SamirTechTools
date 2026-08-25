import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LogEntry } from '../types';
import { generateId, formatTime } from '../utils';

interface LogContextType {
  logs: LogEntry[];
  addLog: (tool: string, action: string, result: string, level?: LogEntry['level']) => void;
  clearLogs: () => void;
  copyLogs: () => void;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((tool: string, action: string, result: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = {
      id: generateId(),
      timestamp: formatTime(new Date()),
      tool,
      action,
      result,
      level,
    };
    setLogs(prev => [...prev, entry]);
    if (window.electronAPI?.appendLog) {
      const now = new Date();
      window.electronAPI.appendLog({
        timestamp: `${now.toLocaleDateString('es-MX')} ${entry.timestamp}`,
        tool: entry.tool,
        action: entry.action,
        result: entry.result,
        level: entry.level,
      });
    }
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const copyLogs = useCallback(() => {
    const text = logs.map(l => `${l.timestamp} | ${l.tool} | ${l.action} | ${l.result}`).join('\n');
    navigator.clipboard.writeText(text);
  }, [logs]);

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs, copyLogs }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (!context) throw new Error('useLogs must be used within LogProvider');
  return context;
}
