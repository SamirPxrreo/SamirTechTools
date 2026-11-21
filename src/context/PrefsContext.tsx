import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export type ThemePref = 'light' | 'dark' | 'system';

interface Prefs {
  theme: ThemePref;
  resolvedTheme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  autoDiagnose: boolean;
  logOpen: boolean;
  /** Si es false (por defecto) las descargas usan las carpetas predeterminadas y se crean solas, sin preguntar. */
  askLocation: boolean;
  setAskLocation: (v: boolean) => void;
  setTheme: (t: ThemePref) => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setAutoDiagnose: (v: boolean) => void;
  setLogOpen: (v: boolean) => void;
}

const PrefsContext = createContext<Prefs | null>(null);

function read<T>(key: string, fallback: T, parse: (v: string) => T): T {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : parse(v);
  } catch {
    return fallback;
  }
}

const systemDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePref>(() =>
    read<ThemePref>('stt-theme', 'dark', v => (v === 'light' || v === 'dark' || v === 'system' ? v : 'dark')),
  );
  const [sysDark, setSysDark] = useState(systemDark);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => read('stt-sidebar-collapsed', false, v => v === '1'));
  const [autoDiagnose, setAutoDiagnoseState] = useState(() => read('stt-autodiag', true, v => v !== '0'));
  const [logOpen, setLogOpenState] = useState(() => read('stt-log-open', false, v => v === '1'));
  const [askLocation, setAskLocationState] = useState(() => read('stt-ask-location', false, v => v === '1'));

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const fn = (e: MediaQueryListEvent) => setSysDark(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (sysDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((t: ThemePref) => {
    setThemeState(t);
    localStorage.setItem('stt-theme', t);
  }, []);
  const toggleTheme = useCallback(() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'), [resolvedTheme, setTheme]);
  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
    localStorage.setItem('stt-sidebar-collapsed', v ? '1' : '0');
  }, []);
  const setAutoDiagnose = useCallback((v: boolean) => {
    setAutoDiagnoseState(v);
    localStorage.setItem('stt-autodiag', v ? '1' : '0');
  }, []);
  const setLogOpen = useCallback((v: boolean) => {
    setLogOpenState(v);
    localStorage.setItem('stt-log-open', v ? '1' : '0');
  }, []);
  const setAskLocation = useCallback((v: boolean) => {
    setAskLocationState(v);
    localStorage.setItem('stt-ask-location', v ? '1' : '0');
  }, []);

  return (
    <PrefsContext.Provider
      value={{ theme, resolvedTheme, sidebarCollapsed, autoDiagnose, logOpen, askLocation, setAskLocation, setTheme, toggleTheme, setSidebarCollapsed, setAutoDiagnose, setLogOpen }}
    >
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within PrefsProvider');
  return ctx;
}
