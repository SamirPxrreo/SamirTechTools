import React, { ReactNode } from 'react';
import { Badge, Button, IconTile, cx } from './ui';

interface ToolCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  status?: 'ok' | 'warning' | 'error' | 'info';
  statusText?: string;
  accentColor?: string;
  primaryAction?: string;
  primaryOnClick?: () => void;
  secondaryAction?: string;
  secondaryOnClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function ToolCard({
  icon,
  title,
  description,
  status,
  statusText,
  accentColor = 'indigo',
  primaryAction,
  primaryOnClick,
  secondaryAction,
  secondaryOnClick,
  loading = false,
  disabled = false,
  children,
  className,
}: ToolCardProps) {
  // Solo se muestran botones que realmente hacen algo
  const showPrimary = !!primaryAction && !!primaryOnClick;
  const showSecondary = !!secondaryAction && !!secondaryOnClick;
  const danger = accentColor === 'red';

  return (
    <div className={cx('card card-interactive group p-4 flex flex-col min-w-0', className)}>
      <div className="flex items-start gap-3">
        <IconTile tone={accentColor}>{icon}</IconTile>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[13.5px] font-semibold text-fg leading-5 truncate">{title}</h3>
            {status && statusText && <Badge status={status} dot className="-mt-px">{statusText}</Badge>}
          </div>
          {description && <p className="text-[12.5px] text-muted leading-relaxed mt-1 line-clamp-3">{description}</p>}
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}

      {(showPrimary || showSecondary) && (
        <div className="flex gap-2 mt-auto pt-4">
          {showPrimary && (
            <Button
              size="sm"
              variant={danger ? 'danger' : 'primary'}
              onClick={primaryOnClick}
              loading={loading}
              disabled={disabled}
            >
              {primaryAction}
            </Button>
          )}
          {showSecondary && (
            <Button size="sm" variant="secondary" onClick={secondaryOnClick}>
              {secondaryAction}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
