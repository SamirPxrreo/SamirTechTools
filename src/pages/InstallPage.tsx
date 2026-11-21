import React, { useState, useMemo } from 'react';
import { Download, CheckCircle2, XCircle, PackagePlus, X, Trash2, PackageSearch, Loader2 } from 'lucide-react';
import { APPS, APP_CATEGORIES, AppEntry } from '../data/apps';
import { useInstall } from '../context/InstallContext';
import { PageHeader, SearchInput, Chip, Checkbox, Button, Modal, EmptyState, ConsoleOutput, ProgressBar, Badge, IconButton, cx } from '../components';

function domainOf(link?: string): string {
  if (!link) return '';
  try { return new URL(link).hostname; } catch { return ''; }
}

function AppLogo({ app }: { app: AppEntry }) {
  const [failed, setFailed] = useState(false);
  const dom = domainOf(app.link);
  return (
    <span className="w-9 h-9 shrink-0 rounded-xl bg-white dark:bg-white/95 ring-1 ring-black/5 grid place-items-center overflow-hidden">
      {dom && !failed ? (
        <img src={`https://icons.duckduckgo.com/ip3/${dom}.ico`} alt="" className="w-5 h-5 object-contain" onError={() => setFailed(true)} draggable={false} />
      ) : (
        <span className="text-[13px] font-bold text-slate-500">{app.name.charAt(0)}</span>
      )}
    </span>
  );
}

const phaseText: Record<string, string> = {
  download: 'Descargando',
  verify: 'Verificando hash',
  install: 'Instalando',
  done: 'Completado',
};

export function InstallPage() {
  const {
    statuses, outputs, liveOutputs, progress, selected, batchBusy, installingCount, activeLiveId,
    toggleSelect, clearSelection, installApp, installBatch, cancelApp, cancelBatch, dismissOutput, clearAllOutputs,
  } = useInstall();
  const [category, setCategory] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [confirmApp, setConfirmApp] = useState<AppEntry | null>(null);
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const counts = useMemo(() => {
    const m: Record<string, number> = { Todas: APPS.length };
    for (const a of APPS) m[a.category] = (m[a.category] || 0) + 1;
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return APPS.filter(a =>
      (category === 'Todas' || a.category === category) &&
      (!q || a.name.toLowerCase().includes(q) || a.wingetId.toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q)),
    );
  }, [category, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, AppEntry[]>();
    for (const app of filtered) {
      if (!map.has(app.category)) map.set(app.category, []);
      map.get(app.category)!.push(app);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const selectedApps = useMemo(() => APPS.filter(a => selected.has(a.wingetId)), [selected]);
  const hasOutputs = Object.keys(outputs).length > 0 || Object.keys(liveOutputs).length > 0;
  const live = activeLiveId ? progress[activeLiveId] : undefined;
  const liveApp = activeLiveId ? APPS.find(a => a.wingetId === activeLiveId) : undefined;

  const renderCard = (app: AppEntry) => {
    const st = statuses[app.wingetId] || 'idle';
    const isSel = selected.has(app.wingetId);
    const clickable = st === 'idle' && !batchBusy;
    return (
      <div
        key={app.wingetId}
        title={app.description || app.wingetId}
        onClick={() => clickable && setConfirmApp(app)}
        className={cx(
          'group relative flex items-center gap-3 p-3 rounded-2xl border bg-surface transition-all duration-150',
          clickable && 'cursor-pointer hover:border-line-strong hover:shadow-lift hover:-translate-y-px',
          st === 'installing' && 'cursor-wait',
          isSel ? 'border-accent/70 ring-4 ring-accent/10' : 'border-line',
        )}
      >
        <AppLogo app={app} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-fg truncate leading-5">{app.name}</p>
          {st === 'idle' && <p className="text-[11px] text-subtle font-mono truncate">{app.wingetId}</p>}
          {st === 'installing' && <p className="text-[11px] text-accent-fg flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Instalando…</p>}
          {st === 'done' && <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Instalado</p>}
          {st === 'error' && <p className="text-[11px] text-red-600 dark:text-red-400">Error al instalar</p>}
        </div>
        {st === 'installing' ? (
          <IconButton label="Cancelar" onClick={e => { e.stopPropagation(); cancelApp(app.wingetId); }} className="w-7 h-7 !text-red-500 hover:!bg-red-500/10"><X size={14} /></IconButton>
        ) : st === 'done' ? (
          <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
        ) : st === 'error' ? (
          <IconButton label="Descartar" onClick={e => { e.stopPropagation(); dismissOutput(app.wingetId); }} className="w-7 h-7 !text-red-500"><XCircle size={15} /></IconButton>
        ) : (
          <span className={cx('transition-opacity', isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
            <Checkbox checked={isSel} onChange={() => toggleSelect(app.wingetId)} label={isSel ? 'Quitar de la selección' : 'Seleccionar'} disabled={batchBusy} />
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="pb-20">
      <PageHeader
        icon={<PackagePlus size={20} />}
        tone="violet"
        title="Instalar aplicaciones"
        description={<>Catálogo de {APPS.length} apps vía WinGet{installingCount > 0 && <span className="text-accent-fg"> · {installingCount} instalando</span>}. Haz clic para instalar o marca varias.</>}
        actions={<SearchInput value={search} onChange={setSearch} placeholder="Buscar app o ID de WinGet…" className="w-72" />}
      >
        <div className="flex gap-1.5 flex-wrap">
          {['Todas', ...APP_CATEGORIES].map(cat => (
            <Chip key={cat} active={category === cat} onClick={() => setCategory(cat)} count={counts[cat] || 0}>{cat}</Chip>
          ))}
        </div>
      </PageHeader>

      {/* Instalación en curso */}
      {hasOutputs && (
        <div className="card p-4 mb-6 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {installingCount > 0 ? <Loader2 size={16} className="animate-spin text-accent-fg shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
              <p className="text-[13px] font-semibold text-fg truncate">
                {installingCount > 0 ? `Instalando ${liveApp?.name ?? activeLiveId ?? ''}` : 'Instalaciones terminadas'}
              </p>
              {installingCount > 1 && <Badge status="accent">{installingCount} en cola</Badge>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {Object.keys(outputs).length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setShowFinal(v => !v)}>{showFinal ? 'Ocultar resultados' : `Ver resultados (${Object.keys(outputs).length})`}</Button>
              )}
              <Button size="sm" variant="ghost" icon={<Trash2 size={13} />} onClick={clearAllOutputs}>Limpiar</Button>
            </div>
          </div>
          {live && (
            <div>
              <div className="flex justify-between text-[11.5px] mb-1.5">
                <span className="text-muted">{phaseText[live.phase || 'download'] || 'Trabajando'}…</span>
                {typeof live.percent === 'number' && <span className="text-fg font-medium tabular-nums">{live.percent}%</span>}
              </div>
              <ProgressBar value={live.percent ?? 0} color={live.phase === 'done' ? 'bg-emerald-500' : 'bg-accent'} height="h-2" />
            </div>
          )}
          {activeLiveId && liveOutputs[activeLiveId] && (
            <ConsoleOutput title={activeLiveId} output={liveOutputs[activeLiveId].slice(-4000)} loading={statuses[activeLiveId] === 'installing'} maxHeight="max-h-40" />
          )}
          {showFinal && Object.entries(outputs).map(([id, o]) => (
            <div key={id} className="relative">
              <ConsoleOutput title={id} output={o.slice(-2000)} maxHeight="max-h-40" />
              <button onClick={() => dismissOutput(id)} className="absolute top-2 right-20 text-[11px] text-slate-400 hover:text-white">Quitar</button>
            </div>
          ))}
        </div>
      )}

      {/* Catálogo */}
      <div className="space-y-7">
        {grouped.map(([cat, apps]) => (
          <section key={cat}>
            <div className="flex items-baseline gap-2 mb-3">
              <h2 className="text-[13px] font-semibold text-fg">{cat}</h2>
              <span className="text-[11.5px] text-subtle tabular-nums">{apps.length}</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5">{apps.map(renderCard)}</div>
          </section>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="card"><EmptyState icon={<PackageSearch size={22} />} title="Sin resultados" description={`No hay apps que coincidan con «${search}».`} action={<Button size="sm" onClick={() => { setSearch(''); setCategory('Todas'); }}>Limpiar filtros</Button>} /></div>
      )}

      {/* Barra flotante de selección */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-20 mt-6 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-elevated/95 backdrop-blur-xl border border-line shadow-pop animate-slide-in">
            <span className="grid place-items-center min-w-[24px] h-6 px-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold tabular-nums">{selected.size}</span>
            <span className="text-[13px] text-fg">app(s) seleccionada(s)</span>
            <div className="w-px h-6 bg-line mx-1" />
            <Button size="sm" variant="ghost" onClick={clearSelection} disabled={batchBusy}>Limpiar</Button>
            {batchBusy ? (
              <Button size="sm" variant="danger" icon={<X size={13} />} onClick={cancelBatch}>Cancelar cola</Button>
            ) : (
              <Button size="sm" variant="primary" icon={<Download size={13} />} onClick={() => setConfirmBatch(true)}>Instalar {selected.size}</Button>
            )}
          </div>
        </div>
      )}

      <Modal
        open={!!confirmApp}
        onClose={() => setConfirmApp(null)}
        icon={<Download size={18} />}
        tone="violet"
        title={`¿Instalar ${confirmApp?.name ?? ''}?`}
        description={confirmApp?.description}
        footer={
          <>
            <Button onClick={() => setConfirmApp(null)}>Cancelar</Button>
            <Button variant="primary" autoFocus onClick={() => { const a = confirmApp!; setConfirmApp(null); installApp(a.wingetId, a.name); }}>Instalar</Button>
          </>
        }
      >
        <div className="flex items-center justify-between rounded-xl bg-surface-2 border border-line px-3 py-2 text-[12px]">
          <span className="text-muted">ID de WinGet</span>
          <code className="font-mono text-fg">{confirmApp?.wingetId}</code>
        </div>
      </Modal>

      <Modal
        open={confirmBatch}
        onClose={() => !batchBusy && setConfirmBatch(false)}
        icon={<PackagePlus size={18} />}
        tone="violet"
        title={`¿Instalar ${selected.size} aplicaciones?`}
        description="Se instalarán en cola, una tras otra. Puedes cancelar la cola en cualquier momento."
        footer={
          <>
            <Button onClick={() => setConfirmBatch(false)} disabled={batchBusy}>Cancelar</Button>
            <Button variant="primary" autoFocus onClick={() => { setConfirmBatch(false); installBatch(); }}>Instalar todo</Button>
          </>
        }
      >
        <div className="max-h-56 overflow-auto rounded-xl border border-line divide-y divide-line">
          {selectedApps.map(a => (
            <div key={a.wingetId} className="flex items-center gap-3 px-3 py-2">
              <AppLogo app={a} />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-fg truncate">{a.name}</p>
                <p className="text-[11px] font-mono text-subtle truncate">{a.wingetId}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
