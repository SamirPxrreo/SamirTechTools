import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Download, Search, CheckCircle2, Loader2, XCircle, DownloadCloud, CheckSquare, Square, X, Terminal } from 'lucide-react';
import { APPS, APP_CATEGORIES, AppEntry } from '../data/apps';
import { useLogs } from '../context/LogContext';

type Status = 'idle' | 'installing' | 'done' | 'error';

function domainOf(link?: string): string {
  if (!link) return '';
  try { return new URL(link).hostname; } catch { return ''; }
}

export function InstallPage() {
  const { addLog } = useLogs();
  const [category, setCategory] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmApp, setConfirmApp] = useState<AppEntry | null>(null);
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);
  const [liveOutputs, setLiveOutputs] = useState<Record<string, string>>({});
  const liveRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (!window.electronAPI?.onWingetProgress) return;
    window.electronAPI.onWingetProgress(({ wingetId, chunk }) => {
      setLiveOutputs(prev => ({ ...prev, [wingetId]: (prev[wingetId] || '') + chunk }));
      // auto-scroll
      setTimeout(() => { if (liveRef.current) liveRef.current.scrollTop = liveRef.current.scrollHeight; }, 50);
    });
  }, []);

  const activeLiveId = useMemo(() => Object.keys(liveOutputs).find(id => statuses[id] === 'installing') || Object.keys(statuses).find(id => statuses[id] === 'installing') || null, [liveOutputs, statuses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return APPS.filter(a =>
      (category === 'Todas' || a.category === category) &&
      (!q || a.name.toLowerCase().includes(q) || a.wingetId.toLowerCase().includes(q))
    );
  }, [category, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const app of filtered) {
      if (!map.has(app.category)) map.set(app.category, []);
      map.get(app.category)!.push(app);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const installingCount = Object.values(statuses).filter(s => s === 'installing').length;

  const toggleSelect = (id: string) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const clearSelection = () => setSelected(new Set());

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
        setStatuses(s => ({ ...s, [wingetId]: 'error' }));
        addLog('Instalar', name, (r.output || 'Error').slice(-200), 'error');
      }
    } catch (err) {
      setStatuses(s => ({ ...s, [wingetId]: 'error' }));
      addLog('Instalar', name, String(err), 'error');
    }
  }, [addLog]);

  const installBatch = useCallback(async () => {
    setBatchBusy(true);
    const ids = APPS.filter(a => selected.has(a.wingetId));
    for (const app of ids) {
      await installApp(app.wingetId, app.name);
    }
    setBatchBusy(false);
    clearSelection();
  }, [selected, installApp]);

  const selectedApps = useMemo(() => APPS.filter(a => selected.has(a.wingetId)), [selected]);

  const renderCard = (app: AppEntry) => {
    const st = statuses[app.wingetId] || 'idle';
    const isSel = selected.has(app.wingetId);
    const dom = domainOf(app.link);
    const clickable = st === 'idle' && !batchBusy;
    return (
      <div
        key={app.wingetId}
        title={app.description || app.wingetId}
        onClick={() => clickable && setConfirmApp(app)}
        className={`bg-white border rounded-md px-3 py-2.5 flex items-center gap-2 text-left transition-all ${
          clickable ? 'cursor-pointer hover:border-primary-500 hover:shadow-sm' : st === 'installing' ? 'cursor-wait' : ''
        } ${isSel ? 'border-primary-600 ring-1 ring-primary-500' : 'border-neutral-300'}`}
      >
        {/* Checkbox de seleccion */}
        <button
          onClick={(e) => { e.stopPropagation(); if (st === 'idle') toggleSelect(app.wingetId); }}
          className="flex-shrink-0 text-neutral-400 hover:text-primary-600 disabled:opacity-30"
          disabled={st !== 'idle'}
          title={isSel ? 'Quitar de la selección' : 'Seleccionar'}
        >
          {isSel ? <CheckSquare size={15} className="text-primary-600" /> : <Square size={15} />}
        </button>

        {dom ? (
          <img
            src={`https://icons.duckduckgo.com/ip3/${dom}.ico`}
            alt=""
            className="w-[18px] h-[18px] flex-shrink-0 rounded-sm pointer-events-none"
            onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
          />
        ) : (
          <span className="w-[18px] flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0 text-left pointer-events-none">
          <span className="block text-xs font-medium text-neutral-800 truncate">{app.name}</span>
          {st === 'done' && <span className="block text-[9px] text-green-600">Instalado</span>}
          {st === 'error' && <span className="block text-[9px] text-red-600">Error - clic para reintentar</span>}
          {st === 'installing' && <span className="block text-[9px] text-blue-600">Instalando...</span>}
        </div>

        {st === 'idle' && !isSel && (
          <Download size={14} className="flex-shrink-0 text-neutral-400 pointer-events-none" />
        )}
        {st === 'installing' && <Loader2 size={14} className="flex-shrink-0 text-blue-600 animate-spin pointer-events-none" />}
        {st === 'done' && <CheckCircle2 size={14} className="flex-shrink-0 text-green-600 pointer-events-none" />}
        {st === 'error' && <XCircle size={14} className="flex-shrink-0 text-red-600 pointer-events-none" />}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Instalar Aplicaciones</h1>
          <p className="text-xs text-dark-400 mt-1">
            Catálogo de programas vía WinGet {installingCount > 0 && `· ${installingCount} instalando...`}
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar aplicación..."
            className="pl-8 pr-3 py-1.5 w-56 bg-white border border-neutral-300 rounded text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Barra de seleccion */}
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 bg-primary-50 border border-primary-300 rounded-md px-3 py-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-primary-800">
            {selected.size} aplicación(es) seleccionada(s)
          </span>
          <div className="flex gap-2">
            <button
              onClick={clearSelection}
              disabled={batchBusy}
              className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded hover:bg-neutral-100 disabled:opacity-50"
            >
              Limpiar
            </button>
            <button
              onClick={() => setConfirmBatch(true)}
              disabled={batchBusy}
              className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded disabled:opacity-50 flex items-center gap-1.5"
            >
              {batchBusy ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {batchBusy ? 'Instalando...' : `Instalar seleccionadas (${selected.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Filtro de categorías */}
      <div className="flex gap-1.5 flex-wrap">
        {['Todas', ...APP_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
              category === cat
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid por categoría */}
      {grouped.map(([cat, apps]) => (
        <div key={cat}>
          <p className="text-sm font-semibold text-neutral-700 mb-2">- {cat}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">
            {apps.map(renderCard)}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-neutral-400">
          <DownloadCloud size={32} className="mx-auto mb-2 opacity-40" />
          No se encontraron aplicaciones
        </div>
      )}

      {/* Modal de confirmacion individual */}
      {confirmApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmApp(null)}>
          <div className="bg-white rounded-lg p-5 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              {domainOf(confirmApp.link) && (
                <img src={`https://icons.duckduckgo.com/ip3/${domainOf(confirmApp.link)}.ico`} alt="" className="w-8 h-8" />
              )}
              <h3 className="text-sm font-bold text-neutral-900">¿Instalar {confirmApp.name}?</h3>
            </div>
            {confirmApp.description && (
              <p className="text-xs text-neutral-600 mb-3 leading-relaxed">{confirmApp.description}</p>
            )}
            <p className="text-[11px] text-neutral-500 mb-4">
              Se descargará e instalará silenciosamente vía WinGet: <code className="text-[10px] bg-neutral-100 px-1 rounded">{confirmApp.wingetId}</code>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmApp(null)}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => { const a = confirmApp; setConfirmApp(null); installApp(a.wingetId, a.name); }}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded"
              >
                Sí, instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmacion por lote */}
      {confirmBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !batchBusy && setConfirmBatch(false)}>
          <div className="bg-white rounded-lg p-5 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900">¿Instalar {selected.size} aplicación(es)?</h3>
              {!batchBusy && <X size={16} className="text-neutral-400 cursor-pointer" onClick={() => setConfirmBatch(false)} />}
            </div>
            <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded mb-4">
              {selectedApps.map(a => (
                <div key={a.wingetId} className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 border-b border-neutral-100 last:border-0">
                  {domainOf(a.link) && (
                    <img src={`https://icons.duckduckgo.com/ip3/${domainOf(a.link)}.ico`} alt="" className="w-4 h-4" />
                  )}
                  <span className="truncate">{a.name}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-neutral-500 mb-4">Se instalarán una por una en segundo plano. Esto puede tardar varios minutos.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmBatch(false)}
                disabled={batchBusy}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 text-xs font-medium rounded hover:bg-neutral-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setConfirmBatch(false); installBatch(); }}
                disabled={batchBusy}
                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded disabled:opacity-50"
              >
                Sí, instalar todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progreso en tiempo real */}
      {activeLiveId && liveOutputs[activeLiveId] && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2 flex items-center gap-2"><Terminal size={14}/> Progreso en vivo — {activeLiveId} <Loader2 size={12} className="animate-spin text-blue-600"/></h3>
          <pre ref={liveRef} className="bg-neutral-900 text-green-400 text-[10px] font-mono p-3 rounded-md max-h-64 overflow-auto whitespace-pre-wrap">
            {liveOutputs[activeLiveId]}
          </pre>
        </div>
      )}
      {/* Salida final */}
      {Object.entries(outputs).some(([, o]) => o) && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-700 mb-2">Salida de WinGet</h3>
          <pre className="bg-neutral-900 text-green-400 text-[10px] font-mono p-3 rounded-md max-h-48 overflow-auto whitespace-pre-wrap">
            {Object.entries(outputs).filter(([, o]) => o).map(([id, o]) => `=== ${id} ===\n${o}`).join('\n\n')}
          </pre>
        </div>
      )}
    </div>
  );
}
