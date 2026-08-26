import React, { useState, useMemo, useCallback } from 'react';
import { Download, Search, CheckCircle2, Loader2, XCircle, DownloadCloud } from 'lucide-react';
import { APPS, APP_CATEGORIES } from '../data/apps';
import { useLogs } from '../context/LogContext';

type Status = 'idle' | 'installing' | 'done' | 'error';

export function InstallPage() {
  const { addLog } = useLogs();
  const [category, setCategory] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});

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

  const installApp = useCallback(async (wingetId: string, name: string) => {
    setStatuses(s => ({ ...s, [wingetId]: 'installing' }));
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

  const installingCount = Object.values(statuses).filter(s => s === 'installing').length;

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
            {apps.map(app => {
              const st = statuses[app.wingetId] || 'idle';
              return (
                <button
                  key={app.wingetId}
                  onClick={() => st === 'idle' && installApp(app.wingetId, app.name)}
                  disabled={st === 'installing'}
                  title={app.description || app.wingetId}
                  className="bg-white border border-neutral-300 rounded-md px-3 py-2.5 flex items-center gap-2 text-left hover:border-primary-500 hover:shadow-sm transition-all disabled:cursor-not-allowed group"
                >
                  {app.link ? (
                    <img
                      src={`https://www.google.com/s2/favicon?sz=64&domain_url=${app.link}`}
                      alt=""
                      className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0 rounded-sm"
                      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }}
                    />
                  ) : (
                    <span className="w-[18px] flex-shrink-0" />
                  )}
                  <span className="flex-shrink-0">
                    {st === 'idle' && <Download size={15} className="text-neutral-400 group-hover:text-primary-600" />}
                    {st === 'installing' && <Loader2 size={15} className="text-blue-600 animate-spin" />}
                    {st === 'done' && <CheckCircle2 size={15} className="text-green-600" />}
                    {st === 'error' && <XCircle size={15} className="text-red-600" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium text-neutral-800 truncate">{app.name}</span>
                    {st === 'done' && <span className="block text-[9px] text-green-600">Instalado</span>}
                    {st === 'error' && <span className="block text-[9px] text-red-600">Error - clic para reintentar</span>}
                    {st === 'installing' && <span className="block text-[9px] text-blue-600">Instalando...</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-neutral-400">
          <DownloadCloud size={32} className="mx-auto mb-2 opacity-40" />
          No se encontraron aplicaciones
        </div>
      )}

      {/* Salida de consola de la última instalación con error */}
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
