# Backup Diseño Original — 2025-09-02

**Fecha:** 2025-09-02
**Motivo:** Antes de aplicar reorganización del menú a 4 grupos + estilo App Linear

## Archivos respaldados
- `src/components/Sidebar.tsx.bak-20250902` — Sidebar original plano 9 items (252px, Minimal Pro, Outfit, slate, rounded-2xl)
- `src/index.css.bak-20250902` — Variables Minimal Pro: --bg #f8fafc / #020617, Outfit, slate palette
- `tailwind.config.js.bak-20250902` — Config Tailwind original

## Diseño original (Minimal Pro)
- Header bg-white/80 backdrop-blur, sidebar 252px, ToolCard rounded-[20px], SystemCard bg-slate-50
- Tipografía Outfit, slate palette, sin agrupación (9 items flat)
- Orden: dashboard -> install (235 apps) -> extra-apps -> office -> windows -> utilities -> network -> uninstaller -> settings

## Nuevo diseño aplicado
- Sidebar 238px, 4 grupos: DIAGNÓSTICO / INSTALACIÓN / SISTEMA / CONFIG
- Labels 9px JetBrains Mono uppercase, Inter 510, estilo App nativo Linear (#0a0a0b, #0f1011, #5e6ad2)
- Todo gratis, solo CSS reordenado en Sidebar.tsx

## Para restaurar
```powershell
Copy-Item "src/components/Sidebar.tsx.bak-20250902" "src/components/Sidebar.tsx" -Force
Copy-Item "src/index.css.bak-20250902" "src/index.css" -Force
Copy-Item "tailwind.config.js.bak-20250902" "tailwind.config.js" -Force
npm run build
```
