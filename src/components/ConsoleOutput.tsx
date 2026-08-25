import React, { useRef, useEffect } from 'react';

interface ConsoleOutputProps {
  output: string;
  loading?: boolean;
}

export function ConsoleOutput({ output, loading = false }: ConsoleOutputProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      ref={ref}
      className="bg-dark-950 border border-dark-700 rounded-lg p-3 font-mono text-xs text-green-400 max-h-64 overflow-y-auto"
    >
      {loading && (
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Ejecutando...
        </div>
      )}
      {output ? (
        <pre className="whitespace-pre-wrap break-all">{output}</pre>
      ) : (
        !loading && <span className="text-dark-500">Sin salida...</span>
      )}
    </div>
  );
}
