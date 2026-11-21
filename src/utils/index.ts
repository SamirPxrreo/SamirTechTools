export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatFrequency(mhz: number): string {
  return `${(mhz / 1000).toFixed(2)} GHz`;
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

export function getStatusColor(level: 'info' | 'success' | 'warning' | 'error'): string {
  switch (level) {
    case 'info': return 'text-sky-600 dark:text-sky-400';
    case 'success': return 'text-emerald-600 dark:text-emerald-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    case 'error': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted';
  }
}

export function getUsageColor(percentage: number): string {
  if (percentage < 70) return 'bg-accent';
  if (percentage < 90) return 'bg-amber-500';
  return 'bg-red-500';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { hour12: false });
}
