import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, RefreshCw, Search, CheckSquare, Square, Loader, Package } from 'lucide-react';
import { ConsoleOutput, ConfirmModal } from '../components';
import { useLogs } from '../context/LogContext';
import { AllApp } from '../types';

function AppIcon({ app }: { app: AllApp }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    window.electronAPI.getAppIcon(app.displayIcon, app.location, app.uninstallString).then(url => {
      if (!cancelled && url) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [app.displayIcon, app.location, app.uninstallString]);
  if (src) return <img src={src} alt="" className="w-7 h-7 flex-shrink-0 rounded-sm object-contain" loading="lazy" />;
  return <div className="w-7 h-7 flex-shrink-0 rounded bg-dark-800 border border-dark-700 flex items-center justify-center"><Package size={12} className="text-dark-500" /></div>;
}

export function UninstallerPage() {
  const { addLog } = useLogs();
  const [apps, setApps] = useState<AllApp[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [publisherFilter, setPublisherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | '3months' | 'year' | 'older'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [loading, setLoading] = useState(true);
  const [uninstalling, setUninstalling] = useState(false);
  const [output, setOutput] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const list = await window.electronAPI.getAllApps();
      setApps(list);
      setSelected(new Set());
      addLog('Desinstalador', 'Listado', `${list.length} aplicaciones encontradas`, 'success');
    } catch (err) {
      addLog('Desinstalador', 'Error', String(err), 'error');
    }
    setLoading(false);
  }, [addLog]);

  useEffect(() => { loadApps(); }, []);

  // Convierte InstallDate del registro (yyyyMMdd o formatos varios) a Date o null
  const parseDate = (raw?: string): Date | null => {
    if (!raw) return null;
    const d = raw.trim();
    if (/^\d{8}$/.test(d)) {
      const dt = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`);
      return isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pub = publisherFilter.trim().toLowerCase();
    const now = Date.now();
    const ranges: Record<string, number> = {
      week: 7 * 864e5, month: 30 * 864e5, '3months': 90 * 864e5, year: 365 * 864e5,
    };
    let list = apps.filter(a => {
      if (q && !a.name.toLowerCase().includes(q) && !(a.publisher || '').toLowerCase().includes(q)) return false;
      if (pub && !(a.publisher || '').toLowerCase().includes(pub)) return false;
      if (dateFilter !== 'all') {
        const d = parseDate(a.installDate);
        if (!d) return dateFilter === 'older' ? false : false;
        const age = now - d.getTime();
        if (dateFilter === 'older') { if (age <= ranges.year) return false; }
        else if (age > ranges[dateFilter]) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'date') {
        const da = parseDate(a.installDate)?.getTime() || 0;
        const db = parseDate(b.installDate)?.getTime() || 0;
        return db - da;
      }
      if (sortBy === 'size') return (b.sizeKB || 0) - (a.sizeKB || 0);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [apps, search, publisherFilter, dateFilter, sortBy]);

  const formatDate = (raw?: string) => {
    const d = parseDate(raw);
    return d ? d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  };

  const formatSize = (kb?: number) => {
    if (!kb || kb <= 0) return '—';
    if (kb >= 1024 * 1024) return `${(kb / 1024 / 1024).toFixed(1)} GB`;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  const toggleApp = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (filtered.every(a => selected.has(a.name))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => a.name)));
    }
  };

  const startUninstall = () => {
    setConfirmOpen(true);
  };

  const confirmUninstall = async () => {
    setConfirmOpen(false);
    setUninstalling(true);
    setOutput('');

    const toRemove = apps.filter(a => selected.has(a.name));
    addLog('Desinstalador', 'Iniciando', `Desinstalando ${toRemove.length} aplicaciones`, 'info');

    try {
      const r = await window.electronAPI.uninstallApps(
        toRemove.map(a => ({ name: a.name, uninstallString: a.uninstallString }))
      );
      setOutput(r.output);
      addLog('Desinstalador', 'Completado', `${toRemove.length} aplicaciones procesadas con limpieza profunda`, r.success ? 'success' : 'error');
    } catch (err) {
      setOutput(String(err));
      addLog('Desinstalador', 'Error', String(err), 'error');
    }

    setUninstalling(false);
    await loadApps();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Desinstalador de Aplicaciones</h1>
        <p className="text-xs text-dark-400 mt-1">Desinstala múltiples apps y elimina todos sus rastros: carpetas, registro, servicios y accesos directos</p>
      </div>

      {/* Barra de acciones */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o editor..."
            className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-9 pr-3 py-2 text-sm text-neutral-900 placeholder-dark-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <input
          type="text"
          value={publisherFilter}
          onChange={e => setPublisherFilter(e.target.value)}
          placeholder="Filtrar por editor..."
          className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-neutral-900 placeholder-dark-500 focus:outline-none focus:border-primary-500 w-40"
        />
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value as typeof dateFilter)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary-500"
        >
          <option value="all">Cualquier fecha</option>
          <option value="week">Instalado esta semana</option>
          <option value="month">Instalado este mes</option>
          <option value="3months">Últimos 3 meses</option>
          <option value="year">Último año</option>
          <option value="older">Más de un año</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-2 text-xs text-neutral-900 focus:outline-none focus:border-primary-500"
        >
          <option value="name">Ordenar: Nombre</option>
          <option value="date">Ordenar: Fecha</option>
          <option value="size">Ordenar: Tamaño</option>
        </select>
        <button
          onClick={toggleAll}
          disabled={loading || filtered.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
        >
          {filtered.length > 0 && filtered.every(a => selected.has(a.name)) ? <CheckSquare size={14} /> : <Square size={14} />}
          Seleccionar todo
        </button>
        <button
          onClick={loadApps}
          disabled={loading || uninstalling}
          className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-200 text-xs font-medium rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Botón desinstalar */}
      <div className="flex items-center justify-between bg-dark-800/50 border border-dark-700 rounded-lg p-4">
        <span className="text-sm text-dark-300">
          {selected.size > 0
            ? <><b className="text-primary-400">{selected.size}</b> aplicación(es) seleccionada(s)</>
            : 'Selecciona las aplicaciones a eliminar'}
        </span>
        <button
          onClick={startUninstall}
          disabled={selected.size === 0 || uninstalling}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected.size > 0 && !uninstalling
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-dark-800 text-dark-500 cursor-not-allowed'
          }`}
        >
          {uninstalling ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {uninstalling ? 'Desinstalando...' : `Desinstalar (${selected.size})`}
        </button>
      </div>

      {/* Lista de apps */}
      <div className="bg-dark-900 border border-dark-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-primary-400" />
            <span className="text-xs text-dark-400">Escaneando aplicaciones instaladas...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-xs text-dark-400">No se encontraron aplicaciones</span>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto divide-y divide-dark-800">
            {filtered.map(app => (
              <label
                key={app.name}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  selected.has(app.name) ? 'bg-primary-600/10' : 'hover:bg-dark-800/60'
                }`}
              >
                <button
                  onClick={(e) => { e.preventDefault(); toggleApp(app.name); }}
                  className="flex-shrink-0"
                >
                  {selected.has(app.name)
                    ? <CheckSquare size={17} className="text-primary-400" />
                    : <Square size={17} className="text-dark-500" />}
                </button>
                <AppIcon app={app} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-900 truncate">{app.name}</p>
                  <p className="text-[10px] text-dark-500 truncate">
                    v{app.version}{app.publisher ? ` • ${app.publisher}` : ''}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right hidden md:block">
                  <p className="text-[10px] text-dark-400">{formatDate(app.installDate)}</p>
                  <p className="text-[10px] text-dark-500">{formatSize(app.sizeKB)}</p>
                </div>
                {!app.uninstallString && (
                  <span className="text-[10px] text-yellow-500 flex-shrink-0">sin desinstalador</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Consola */}
      {(output || uninstalling) && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-dark-300 mb-2">Registro de limpieza</h3>
          <ConsoleOutput output={output} loading={uninstalling} />
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Desinstalar aplicaciones"
        message={`Se desinstalarán ${selected.size} aplicación(es) y se eliminará TODO rastro:\n\n• Ejecutable/desinstalador original (modo silencioso)\n• Carpetas en Program Files, ProgramData y AppData\n• Claves de registro del desinstalador\n• Entradas de inicio automático (Run keys)\n• Servicios asociados\n• Accesos directos (Inicio y Escritorio)\n\n⚠️ Esta acción NO se puede deshacer.\n\n¿Continuar?`}
        confirmText={`Desinstalar ${selected.size}`}
        danger
        onConfirm={confirmUninstall}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
