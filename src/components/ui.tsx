import React, { ReactNode, useEffect } from 'react';
import { Loader2, Search, X, ChevronDown, Check } from 'lucide-react';

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

export type Tone =
  | 'indigo' | 'emerald' | 'amber' | 'red' | 'violet' | 'cyan' | 'orange' | 'pink' | 'teal' | 'sky' | 'slate';

// Nombres antiguos usados por las páginas (accentColor="blue" etc.)
const toneAlias: Record<string, Tone> = {
  blue: 'indigo', green: 'emerald', yellow: 'amber', purple: 'violet',
};
export const resolveTone = (t?: string): Tone => (toneAlias[t ?? ''] ?? (t as Tone)) || 'indigo';

const toneTile: Record<Tone, string> = {
  indigo: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20 dark:text-indigo-300',
  emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300',
  amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-300',
  red: 'bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-300',
  violet: 'bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-300',
  cyan: 'bg-cyan-500/10 text-cyan-600 ring-cyan-500/20 dark:text-cyan-300',
  orange: 'bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-300',
  pink: 'bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-300',
  teal: 'bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-300',
  sky: 'bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-300',
  slate: 'bg-slate-500/10 text-slate-600 ring-slate-500/20 dark:text-slate-300',
};

export function IconTile({ tone = 'indigo', size = 'md', children, className }: { tone?: string; size?: 'sm' | 'md' | 'lg'; children: ReactNode; className?: string }) {
  const s = size === 'sm' ? 'w-7 h-7 rounded-lg' : size === 'lg' ? 'w-11 h-11 rounded-xl' : 'w-9 h-9 rounded-xl';
  return <span className={cx('grid place-items-center shrink-0 ring-1 ring-inset', s, toneTile[resolveTone(tone)], className)}>{children}</span>;
}

/* --------------------------------------------------------------------------
   Badge
   -------------------------------------------------------------------------- */
export type Status = 'ok' | 'warning' | 'error' | 'info' | 'neutral' | 'accent';
const badgeTone: Record<Status, string> = {
  ok: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300',
  error: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-300',
  info: 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300',
  neutral: 'bg-surface-2 text-muted ring-line',
  accent: 'bg-accent/10 text-accent-fg ring-accent/25',
};
const dotTone: Record<Status, string> = {
  ok: 'bg-emerald-500', warning: 'bg-amber-500', error: 'bg-red-500', info: 'bg-sky-500', neutral: 'bg-subtle', accent: 'bg-accent',
};

export function Badge({ status = 'neutral', dot = false, children, className }: { status?: Status; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px] font-medium ring-1 ring-inset whitespace-nowrap', badgeTone[status], className)}>
      {dot && <span className={cx('w-1.5 h-1.5 rounded-full', dotTone[status])} />}
      {children}
    </span>
  );
}

/* --------------------------------------------------------------------------
   Button
   -------------------------------------------------------------------------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-soft';
const btnVariant: Record<BtnVariant, string> = {
  primary: 'bg-accent text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.15)] hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface text-fg border border-line hover:bg-surface-2 hover:border-line-strong',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-red-600 text-white hover:bg-red-500 shadow-[inset_0_1px_0_rgb(255_255_255/0.15)]',
  'danger-soft': 'bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-500/15',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({ variant = 'secondary', size = 'md', icon, loading, className, children, disabled, ...rest }: ButtonProps) {
  const s = size === 'sm' ? 'h-8 px-3 text-[12px] gap-1.5 rounded-lg' : size === 'lg' ? 'h-10 px-4 text-[13.5px] gap-2 rounded-xl' : 'h-9 px-3.5 text-[13px] gap-2 rounded-xl';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center font-medium whitespace-nowrap select-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
        s, btnVariant[variant], className,
      )}
    >
      {loading ? <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({ label, className, children, active, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      {...rest}
      title={label}
      aria-label={label}
      className={cx(
        'w-8 h-8 grid place-items-center rounded-lg transition-colors disabled:opacity-40',
        active ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg hover:bg-surface-2',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={cx('animate-spin text-accent-fg', className)} />;
}

/* --------------------------------------------------------------------------
   Layout
   -------------------------------------------------------------------------- */
export function PageHeader({ icon, tone = 'indigo', title, description, actions, children }: {
  icon?: ReactNode; tone?: string; title: string; description?: ReactNode; actions?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && <IconTile tone={tone} size="lg">{icon}</IconTile>}
          <div className="min-w-0">
            <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-fg">{title}</h1>
            {description && <p className="text-[13px] text-muted mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function Section({ title, icon, description, right, children, className }: {
  title: string; icon?: ReactNode; description?: string; right?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={cx('space-y-3', className)}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            {icon && <span className="text-subtle">{icon}</span>}
            {title}
          </h2>
          {description && <p className="text-[12px] text-muted mt-0.5">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Grid({ children, cols = 3, className }: { children: ReactNode; cols?: 2 | 3 | 4; className?: string }) {
  const c = cols === 2 ? 'grid-cols-1 lg:grid-cols-2' : cols === 4 ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-3';
  return <div className={cx('grid gap-3', c, className)}>{children}</div>;
}

/* --------------------------------------------------------------------------
   Notice / Empty state
   -------------------------------------------------------------------------- */
const noticeTone: Record<string, string> = {
  info: 'bg-sky-500/[0.06] border-sky-500/20 text-sky-700 dark:text-sky-300',
  warning: 'bg-amber-500/[0.07] border-amber-500/25 text-amber-700 dark:text-amber-300',
  error: 'bg-red-500/[0.06] border-red-500/25 text-red-700 dark:text-red-300',
  accent: 'bg-accent/[0.06] border-accent/20 text-accent-fg',
};
export function Notice({ tone = 'info', icon, title, children }: { tone?: 'info' | 'warning' | 'error' | 'accent'; icon?: ReactNode; title?: string; children?: ReactNode }) {
  return (
    <div className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', noticeTone[tone])}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 text-[12.5px] leading-relaxed">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-muted">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-line grid place-items-center text-subtle mb-3">{icon}</div>
      <p className="text-[13.5px] font-medium text-fg">{title}</p>
      {description && <p className="text-[12.5px] text-muted mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Inputs
   -------------------------------------------------------------------------- */
export function SearchInput({ value, onChange, placeholder = 'Buscar...', className, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string; autoFocus?: boolean;
}) {
  return (
    <div className={cx('relative', className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="field pl-9 pr-8"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 grid place-items-center rounded-md text-subtle hover:text-fg hover:bg-surface-2" aria-label="Limpiar">
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export function Select<T extends string>({ value, onChange, options, className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; className?: string;
}) {
  return (
    <div className={cx('relative', className)}>
      <select value={value} onChange={e => onChange(e.target.value as T)} className="field appearance-none pr-8 cursor-pointer">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
    </div>
  );
}

export function Checkbox({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={e => { e.stopPropagation(); e.preventDefault(); onChange?.(!checked); }}
      className={cx(
        'w-[18px] h-[18px] shrink-0 rounded-[6px] grid place-items-center border transition-all disabled:opacity-30',
        checked ? 'bg-accent border-accent text-white' : 'bg-surface border-line-strong hover:border-accent/60',
      )}
    >
      {checked && <Check size={12} strokeWidth={3} />}
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative w-10 h-6 rounded-full transition-colors shrink-0', checked ? 'bg-accent' : 'bg-line-strong')}
    >
      <span className={cx('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
    </button>
  );
}

/* --------------------------------------------------------------------------
   Tabs (segmented control)
   -------------------------------------------------------------------------- */
export function Tabs<T extends string>({ items, value, onChange, className }: {
  items: { id: T; label: string; icon?: ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div className={cx('inline-flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-line', className)}>
      {items.map(it => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={cx(
              'h-8 px-3 inline-flex items-center gap-2 rounded-lg text-[12.5px] font-medium transition-all',
              active ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-muted hover:text-fg',
            )}
          >
            {it.icon && <span className={active ? 'text-accent-fg' : ''}>{it.icon}</span>}
            {it.label}
            {typeof it.count === 'number' && (
              <span className={cx('text-[10.5px] tabular-nums px-1.5 rounded-md', active ? 'bg-accent/10 text-accent-fg' : 'bg-line/60 text-subtle')}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Chip({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'h-7 px-3 inline-flex items-center gap-1.5 rounded-full text-[12px] font-medium border transition-colors',
        active ? 'bg-fg text-bg border-fg' : 'bg-surface text-muted border-line hover:text-fg hover:border-line-strong',
      )}
    >
      {children}
      {typeof count === 'number' && <span className={cx('tabular-nums text-[10.5px]', active ? 'opacity-70' : 'text-subtle')}>{count}</span>}
    </button>
  );
}

/* --------------------------------------------------------------------------
   Modal
   -------------------------------------------------------------------------- */
export function Modal({ open, onClose, title, description, icon, tone = 'indigo', children, footer, width = 'max-w-md' }: {
  open: boolean; onClose: () => void; title: string; description?: ReactNode; icon?: ReactNode; tone?: string;
  children?: ReactNode; footer?: ReactNode; width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-[3px] animate-fade-in" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onMouseDown={e => e.stopPropagation()}
        className={cx('w-full bg-elevated border border-line rounded-2xl shadow-pop animate-scale-in overflow-hidden', width)}
      >
        <div className="flex items-start gap-3.5 p-5 pb-4">
          {icon && <IconTile tone={tone}>{icon}</IconTile>}
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-fg leading-6">{title}</h3>
            {description && <div className="text-[12.5px] text-muted mt-1 leading-relaxed whitespace-pre-line">{description}</div>}
          </div>
          <IconButton label="Cerrar" onClick={onClose} className="-mr-1 -mt-1"><X size={15} /></IconButton>
        </div>
        {children && <div className="px-5 pb-4">{children}</div>}
        {footer && <div className="flex justify-end gap-2 px-5 py-3.5 bg-surface-2/60 border-t border-line">{footer}</div>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Data display
   -------------------------------------------------------------------------- */
export function KeyValue({ label, value, mono, span }: { label: string; value?: ReactNode; mono?: boolean; span?: boolean }) {
  return (
    <div className={cx('min-w-0', span && 'col-span-2')}>
      <p className="text-[11px] text-subtle">{label}</p>
      <p className={cx('text-[13px] font-medium text-fg mt-0.5 break-words select-text leading-snug', mono && 'font-mono text-[12px]')} title={typeof value === 'string' ? value : undefined}>
        {value ?? '—'}
      </p>
    </div>
  );
}
