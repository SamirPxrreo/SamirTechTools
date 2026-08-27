import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Search, CheckCircle2, Loader2, XCircle, DownloadCloud, CheckSquare, Square, X, Terminal, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { APPS, APP_CATEGORIES, AppEntry } from '../data/apps';
import { useInstall } from '../context/InstallContext';

function domainOf(link?: string): string {
  if (!link) return '';
  try { return new URL(link).hostname; } catch { return ''; }
}

export function InstallPage() {
  const { statuses, outputs, liveOutputs, selected, batchBusy, installingCount, activeLiveId, toggleSelect, clearSelection, installApp, installBatch, cancelApp, cancelBatch, dismissOutput, clearAllOutputs } = useInstall();
  const [category, setCategory] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [confirmApp, setConfirmApp] = useState<AppEntry | null>(null);
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [showLive, setShowLive] = useState(true);
  const [showOutputs, setShowOutputs] = useState(false);
  const liveRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (liveRef.current && showLive) liveRef.current.scrollTop = liveRef.current.scrollHeight;
  }, [liveOutputs, showLive]);

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
        className={`bg-white border rounded-xl px-3 py-2.5 flex items-center gap-2 text-left transition-all ${
          clickable ? 'cursor-pointer hover:border-indigo-400 hover:shadow-sm' : st === 'installing' ? 'cursor-wait' : ''
        } ${isSel ? 'border-indigo-600 ring-1 ring-indigo-500' : 'border-slate-200'}`}
      >
        <button
          onClick={(e) => { e.stopPropagation(); if (st === 'idle') toggleSelect(app.wingetId); }}
          className="flex-shrink-0 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
          disabled={st !== 'idle'}
          title={isSel ? 'Quitar' : 'Seleccionar'}
        >
          {isSel ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
        </button>

        {dom ? (
          <img src={`https://icons.duckduckgo.com/ip3/${dom}.ico`} alt="" className="w-[18px] h-[18px] flex-shrink-0 rounded-sm pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
        ) : <span className="w-[18px] flex-shrink-0" />}

        <div className="flex-1 min-w-0 text-left pointer-events-none">
          <span className="block text-xs font-medium text-slate-800 truncate">{app.name}</span>
          {st === 'done' && <span className="block text-[10px] text-emerald-600">Instalado</span>}
          {st === 'error' && <span className="block text-[10px] text-red-600">Error</span>}
          {st === 'installing' && <span className="block text-[10px] text-blue-600">Instalando...</span>}
        </div>

        {st === 'installing' ? (
          <button onClick={(e) => { e.stopPropagation(); cancelApp(app.wingetId); }} className="flex-shrink-0 w-7 h-7 grid place-items-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600" title="Cancelar">
            <X size={14} />
          </button>
        ) : st === 'idle' && !isSel ? (
          <Download size={14} className="flex-shrink-0 text-slate-300 pointer-events-none" />
        ) : st === 'done' ? (
          <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-600 pointer-events-none" />
        ) : st === 'error' ? (
          <button onClick={(e) => { e.stopPropagation(); dismissOutput(app.wingetId); }} className="flex-shrink-0 text-red-400 hover:text-red-600" title="Descartar"><XCircle size={14} /></button>
        ) : null}
      </div>
    );
  };

  const hasOutputs = Object.keys(outputs).length > 0 || Object.keys(liveOutputs).length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Instalar Aplicaciones</h1>
          <p className="text-xs text-slate-500 mt-1">Catálogo vía WinGet {installingCount > 0 && `· ${installingCount} instalando...`}</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-8 pr-3 py-1.5 w-56 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="sticky top-0 z-10 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-indigo-800">{selected.size} seleccionada(s)</span>
          <div className="flex gap-2">
            <button onClick={clearSelection} disabled={batchBusy} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50">Limpiar</button>
            {batchBusy ? (
              <button onClick={cancelBatch} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"><X size={13} />Cancelar</button>
            ) : (
              <button onClick={() => setConfirmBatch(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5"><Download size={13} />Instalar ({selected.size})</button>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap">
        {['Todas', ...APP_CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
        ))}
      </div>

      {grouped.map(([cat, apps]) => (
        <div key={cat}>
          <p className="text-sm font-semibold text-slate-700 mb-2">{cat}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-2">{apps.map(renderCard)}</div>
        </div>
      ))}
      {filtered.length === 0 && <div className="text-center py-12 text-sm text-slate-400"><DownloadCloud size={32} className="mx-auto mb-2 opacity-40" />No se encontraron</div>}

      {/* Registro compacto y colapsable */}
      {hasOutputs && (
        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
            <button onClick={() => setShowLive(!showLive)} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              {showLive ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Registro {installingCount > 0 && <span className="text-blue-600">· {installingCount} en curso</span>}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowOutputs(!showOutputs)} className="text-[11px] text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-transparent hover:border-slate-200">{showOutputs ? 'Ocultar final' : 'Ver final'}</button>
              <button onClick={clearAllOutputs} className="text-[11px] text-red-600 hover:text-red-700 px-2 py-1 rounded border border-transparent hover:border-red-200 flex items-center gap-1"><Trash2 size={12} />Limpiar</button>
            </div>
          </div>
          {showLive && activeLiveId && liveOutputs[activeLiveId] && (
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-2"><Terminal size={12} />{activeLiveId} {statuses[activeLiveId] === 'installing' && <Loader2 size={10} className="animate-spin text-blue-600" />}</p>
              <pre ref={liveRef} className="bg-slate-900 text-emerald-400 text-[11px] font-mono p-2.5 rounded-lg max-h-32 overflow-auto whitespace-pre-wrap leading-relaxed">{liveOutputs[activeLiveId].slice(-4000)}</pre>
            </div>
          )}
          {showOutputs && Object.keys(outputs).length > 0 && (
            <div className="px-3 py-2 max-h-32 overflow-auto">
              {Object.entries(outputs).map(([id, o]) => (
                <div key={id} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-slate-700">{id}</span><button onClick={() => dismissOutput(id)} className="text-[10px] text-slate-400 hover:text-red-600"><X size={10} /></button></div>
                  <pre className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-mono p-2 rounded-lg whitespace-pre-wrap">{o.slice(-2000)}</pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setConfirmApp(null)}>
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-2">¿Instalar {confirmApp.name}?</h3>
            <p className="text-[11px] text-slate-500 mb-4">WinGet: <code className="bg-slate-100 px-1 rounded">{confirmApp.wingetId}</code></p>
            <div className="flex gap-2 justify-end"><button onClick={() => setConfirmApp(null)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">Cancelar</button><button onClick={() => { const a = confirmApp; setConfirmApp(null); installApp(a.wingetId, a.name); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Instalar</button></div>
          </div>
        </div>
      )}
      {confirmBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => !batchBusy && setConfirmBatch(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-slate-900 mb-3">¿Instalar {selected.size} apps?</h3>
            <div className="max-h-40 overflow-auto border rounded-lg mb-4">{selectedApps.map(a => <div key={a.wingetId} className="px-3 py-1.5 text-xs border-b last:border-0">{a.name}</div>)}</div>
            <div className="flex gap-2 justify-end"><button onClick={() => setConfirmBatch(false)} disabled={batchBusy} className="px-3 py-1.5 border rounded-lg text-xs">Cancelar</button><button onClick={() => { setConfirmBatch(false); installBatch(); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs">Instalar todo</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
