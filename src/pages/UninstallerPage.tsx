import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, RefreshCw, Package, PackageX, History } from 'lucide-react';
import { ConsoleOutput, ConfirmModal, PageHeader, SearchInput, Select, Checkbox, Button, Badge, EmptyState, Switch, Spinner, cx } from '../components';
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
  if (src) return <img src={src} alt="" className="w-8 h-8 shrink-0 rounded-lg object-contain" loading="lazy" draggable={false} />;
  return (
    <div className="w-8 h-8 shrink-0 rounded-lg bg-surface-2 border border-line grid place-items-center">
      <Package size={14} className="text-subtle" />
    </div>
  );
}

type DateFilter = 'all' | 'week' | 'month' | '3months' | 'year' | 'older';
type SortBy = 'name' | 'date' | 'size';

export function UninstallerPage() {
  const { addLog } = useLogs();
  const [apps, setApps] = useState<AllApp[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [publisherFilter, setPublisherFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [loading, setLoading] = useState(true);
  const [uninstalling, setUninstalling] = useState(false);
  const [output, setOutput] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createRestore, setCreateRestore] = useState(true);

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
        if (!d) return false;
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

  const allSelected = filtered.length > 0 && filtered.every(a => selected.has(a.name));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(filtered.map(a => a.name)));

  const selectedSizeKB = apps.filter(a => selected.has(a.name)).reduce((s, a) => s + (a.sizeKB || 0), 0);

  const confirmUninstall = async () => {
    setConfirmOpen(false);
    setUninstalling(true);
    setOutput('');

    const toRemove = apps.filter(a => selected.has(a.name));
    if (createRestore) {
      setOutput('Creando punto de restauración...\n');
      addLog('Desinstalador', 'Restauración', 'Creando punto de restauración', 'info');
      try {
        const rp = await window.electronAPI.createRestorePoint(`SamirTechTools - Antes de desinstalar ${toRemove.length} apps`);
        setOutput(prev => prev + (rp.output || '') + '\n');
        addLog('Desinstalador', rp.success ? 'Restauración OK' : 'Restauración fallo', rp.output || '', rp.success ? 'success' : 'warning');
      } catch (e) { setOutput(prev => prev + String(e) + '\n'); }
    }
    addLog('Desinstalador', 'Iniciando', `Desinstalando ${toRemove.length} aplicaciones`, 'info');

    try {
      const r = await window.electronAPI.uninstallApps(
        toRemove.map(a => ({ name: a.name, uninstallString: a.uninstallString })),
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
    <div className="pb-20">
      <PageHeader
        icon={<Trash2 size={20} />}
        tone="red"
        title="Desinstalador"
        description="Desinstala varias apps a la vez y elimina sus rastros: carpetas, registro, servicios y accesos directos"
        actions={
          <Button icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />} onClick={loadApps} disabled={loading || uninstalling}>
            Actualizar lista
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center mb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre o editor…" className="flex-1 min-w-[240px]" />
        <input
          value={publisherFilter}
          onChange={e => setPublisherFilter(e.target.value)}
          placeholder="Editor…"
          className="field w-40"
        />
        <Select<DateFilter>
          value={dateFilter}
          onChange={setDateFilter}
          className="w-48"
          options={[
            { value: 'all', label: 'Cualquier fecha' },
            { value: 'week', label: 'Esta semana' },
            { value: 'month', label: 'Este mes' },
            { value: '3months', label: 'Últimos 3 meses' },
            { value: 'year', label: 'Último año' },
            { value: 'older', label: 'Hace más de un año' },
          ]}
        />
        <Select<SortBy>
          value={sortBy}
          onChange={setSortBy}
          className="w-44"
          options={[
            { value: 'name', label: 'Ordenar por nombre' },
            { value: 'date', label: 'Más recientes' },
            { value: 'size', label: 'Más pesadas' },
          ]}
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_140px_100px] items-center gap-4 px-4 h-10 border-b border-line bg-surface-2/60 text-[11.5px] font-medium text-subtle">
          <Checkbox checked={allSelected} onChange={toggleAll} disabled={loading || filtered.length === 0} label="Seleccionar todo" />
          <span>
            Aplicación
            {!loading && <span className="ml-2 tabular-nums text-subtle/80">{filtered.length}{filtered.length !== apps.length && ` de ${apps.length}`}</span>}
          </span>
          <span className="hidden md:block">Instalada</span>
          <span className="hidden md:block text-right">Tamaño</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Spinner size={22} />
            <span className="text-[12.5px] text-muted">Escaneando aplicaciones instaladas…</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<PackageX size={22} />} title="No se encontraron aplicaciones" description="Prueba con otros filtros o actualiza la lista." />
        ) : (
          <div className="max-h-[calc(100vh-360px)] min-h-[240px] overflow-y-auto divide-y divide-line/70">
            {filtered.map(app => {
              const isSel = selected.has(app.name);
              return (
                <div
                  key={app.name}
                  onClick={() => toggleApp(app.name)}
                  className={cx(
                    'grid grid-cols-[auto_1fr_140px_100px] items-center gap-4 px-4 py-2.5 cursor-pointer transition-colors',
                    isSel ? 'bg-accent/[0.07]' : 'hover:bg-surface-2/70',
                  )}
                >
                  <Checkbox checked={isSel} onChange={() => toggleApp(app.name)} label={app.name} />
                  <div className="flex items-center gap-3 min-w-0">
                    <AppIcon app={app} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-fg truncate flex items-center gap-2">
                        <span className="truncate">{app.name}</span>
                        {!app.uninstallString && <Badge status="warning">Sin desinstalador</Badge>}
                      </p>
                      <p className="text-[11.5px] text-subtle truncate">
                        {app.publisher || 'Editor desconocido'}{app.version ? ` · v${app.version}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="hidden md:block text-[12px] text-muted tabular-nums">{formatDate(app.installDate)}</span>
                  <span className="hidden md:block text-[12px] text-muted tabular-nums text-right">{formatSize(app.sizeKB)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(output || uninstalling) && <ConsoleOutput title="Registro de limpieza" output={output} loading={uninstalling} className="mt-6" />}

      {/* Barra flotante */}
      {(selected.size > 0 || uninstalling) && (
        <div className="sticky bottom-4 z-20 mt-6 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-elevated/95 backdrop-blur-xl border border-line shadow-pop animate-slide-in">
            <span className="grid place-items-center min-w-[24px] h-6 px-1.5 rounded-lg bg-red-600 text-white text-[12px] font-semibold tabular-nums">{selected.size}</span>
            <span className="text-[13px] text-fg">
              seleccionada(s){selectedSizeKB > 0 && <span className="text-muted"> · {formatSize(selectedSizeKB)}</span>}
            </span>
            <div className="w-px h-6 bg-line mx-1" />
            <label className="flex items-center gap-2 text-[12px] text-muted cursor-pointer select-none" title="Recomendado: permite deshacer cambios del sistema">
              <Switch checked={createRestore} onChange={setCreateRestore} label="Crear punto de restauración" />
              <History size={13} /> Punto de restauración
            </label>
            <div className="w-px h-6 bg-line mx-1" />
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} disabled={uninstalling}>Limpiar</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => setConfirmOpen(true)} loading={uninstalling} disabled={selected.size === 0}>
              {uninstalling ? 'Desinstalando…' : `Desinstalar ${selected.size}`}
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title={`Desinstalar ${selected.size} aplicación(es)`}
        message={'Se eliminará todo rastro de cada app:\n• Desinstalador original en modo silencioso\n• Carpetas en Program Files, ProgramData y AppData\n• Claves de registro y entradas de inicio (Run)\n• Servicios asociados y accesos directos\n\nEsta acción no se puede deshacer' + (createRestore ? ' (se creará un punto de restauración antes).' : '.')}
        confirmText={`Desinstalar ${selected.size}`}
        danger
        onConfirm={confirmUninstall}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
