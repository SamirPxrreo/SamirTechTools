import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { APPS } from '../data/apps';
import { useLogs } from './LogContext';

type Status = 'idle' | 'installing' | 'done' | 'error';

interface InstallState {
  statuses: Record<string, Status>;
  outputs: Record<string, string>;
  liveOutputs: Record<string, string>;
  selected: Set<string>;
  batchBusy: boolean;
  installingCount: number;
  activeLiveId: string | null;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  installApp: (wingetId: string, name: string) => Promise<void>;
  installBatch: () => Promise<void>;
  cancelApp: (wingetId: string) => Promise<void>;
  cancelBatch: () => Promise<void>;
  dismissOutput: (id: string) => void;
  clearAllOutputs: () => void;
}

const Ctx = createContext<InstallState | null>(null);

export function InstallProvider({ children }: { children: React.ReactNode }) {
  const { addLog } = useLogs();
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [liveOutputs, setLiveOutputs] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const batchCancelRef = useRef(false);

  useEffect(() => {
    if (!window.electronAPI?.onWingetProgress) return;
    window.electronAPI.onWingetProgress(({ wingetId, chunk }) => {
      setLiveOutputs(prev => ({ ...prev, [wingetId]: (prev[wingetId] || '') + chunk }));
    });
  }, []);

  const activeLiveId = React.useMemo(() => {
    const installing = Object.keys(statuses).find(id => statuses[id] === 'installing');
    if (installing) return installing;
    const lastLive = Object.keys(liveOutputs).sort().pop();
    return lastLive || null;
  }, [statuses, liveOutputs]);

  const installingCount = Object.values(statuses).filter(s => s === 'installing').length;

  const toggleSelect = useCallback((id: string) => {
    setSelected(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const dismissOutput = useCallback((id: string) => {
    setOutputs(o => { const n = { ...o }; delete n[id]; return n; });
    setLiveOutputs(o => { const n = { ...o }; delete n[id]; return n; });
    setStatuses(s => { const n = { ...s }; if (n[id] === 'done' || n[id] === 'error') delete n[id]; return n; });
  }, []);
  const clearAllOutputs = useCallback(() => { setOutputs({}); setLiveOutputs({}); }, []);

  const installApp = useCallback(async (wingetId: string, name: string) => {
    setStatuses(s => ({ ...s, [wingetId]: 'installing' }));
    setLiveOutputs(prev => ({ ...prev, [wingetId]: '' }));
    addLog('Instalar', name, `winget install ${wingetId}`, 'info');
    try {
      const r = await window.electronAPI.wingetInstall(wingetId);
      setOutputs(o => ({ ...o, [wingetId]: r.output || '' }));
      if (r.success) {
        setStatuses(s => ({ ...s, [wingetId]: 'done' }));
        addLog('Instalar', name, 'Instalado correctamente', 'success');
      } else {
        // si fue cancelado, marcar idle en vez de error
        if (/cancelado|killed|Timeout.*cancel/i.test(r.output || '')) {
          setStatuses(s => { const n = { ...s }; delete n[wingetId]; return n; });
          addLog('Instalar', name, 'Cancelado', 'warning');
        } else {
          setStatuses(s => ({ ...s, [wingetId]: 'error' }));
          addLog('Instalar', name, (r.output || 'Error').slice(-200), 'error');
        }
      }
    } catch (err) {
      setStatuses(s => ({ ...s, [wingetId]: 'error' }));
      addLog('Instalar', name, String(err), 'error');
    }
  }, [addLog]);

  const installBatch = useCallback(async () => {
    setBatchBusy(true);
    batchCancelRef.current = false;
    const ids = APPS.filter(a => selected.has(a.wingetId));
    for (const app of ids) {
      if (batchCancelRef.current) break;
      // saltar si ya no está seleccionado (fue cancelado individualmente)
      await installApp(app.wingetId, app.name);
    }
    setBatchBusy(false);
    if (!batchCancelRef.current) clearSelection();
  }, [selected, installApp]);

  const cancelApp = useCallback(async (wingetId: string) => {
    try { await window.electronAPI.wingetCancel(wingetId); } catch {}
    setStatuses(s => { const n = { ...s }; if (n[wingetId] === 'installing') delete n[wingetId]; return n; });
    setLiveOutputs(prev => ({ ...prev, [wingetId]: (prev[wingetId] || '') + '\n[Cancelado por usuario]' }));
  }, []);

  const cancelBatch = useCallback(async () => {
    batchCancelRef.current = true;
    // cancelar el que esté instalando actualmente
    const installing = Object.keys(statuses).find(id => statuses[id] === 'installing');
    if (installing) await cancelApp(installing);
    setBatchBusy(false);
  }, [statuses, cancelApp]);

  return (
    <Ctx.Provider value={{ statuses, outputs, liveOutputs, selected, batchBusy, installingCount, activeLiveId, toggleSelect, clearSelection, installApp, installBatch, cancelApp, cancelBatch, dismissOutput, clearAllOutputs }}>
      {children}
    </Ctx.Provider>
  );
}

export function useInstall() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useInstall fuera de InstallProvider');
  return v;
}
