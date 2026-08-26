export interface AppEntry {
  name: string;
  wingetId: string;
  category: string;
}

export const APP_CATEGORIES = [
  'Navegadores',
  'Mensajería',
  'Multimedia',
  'Utilidades',
  'Desarrollo',
  'Juegos',
  'Microsoft',
] as const;

export const APPS: AppEntry[] = [
  // Navegadores
  { name: 'Brave', wingetId: 'Brave.Brave', category: 'Navegadores' },
  { name: 'Chrome', wingetId: 'Google.Chrome', category: 'Navegadores' },
  { name: 'Firefox', wingetId: 'Mozilla.Firefox', category: 'Navegadores' },
  { name: 'Edge', wingetId: 'Microsoft.Edge', category: 'Navegadores' },
  { name: 'Opera', wingetId: 'Opera.Opera', category: 'Navegadores' },
  { name: 'Opera GX', wingetId: 'Opera.OperaGX', category: 'Navegadores' },
  { name: 'Vivaldi', wingetId: 'Vivaldi.Vivaldi', category: 'Navegadores' },
  { name: 'LibreWolf', wingetId: 'LibreWolf.LibreWolf', category: 'Navegadores' },
  { name: 'Tor Browser', wingetId: 'TorProject.TorBrowser', category: 'Navegadores' },

  // Mensajería
  { name: 'Discord', wingetId: 'Discord.Discord', category: 'Mensajería' },
  { name: 'WhatsApp', wingetId: 'WhatsApp.WhatsApp', category: 'Mensajería' },
  { name: 'Telegram', wingetId: 'Telegram.TelegramDesktop', category: 'Mensajería' },
  { name: 'Signal', wingetId: 'OpenWhisperSystems.Signal', category: 'Mensajería' },
  { name: 'Slack', wingetId: 'SlackTechnologies.Slack', category: 'Mensajería' },
  { name: 'Teams', wingetId: 'Microsoft.Teams', category: 'Mensajería' },
  { name: 'Zoom', wingetId: 'Zoom.Zoom', category: 'Mensajería' },
  { name: 'Thunderbird', wingetId: 'Mozilla.Thunderbird', category: 'Mensajería' },

  // Multimedia
  { name: 'VLC', wingetId: 'VideoLAN.VLC', category: 'Multimedia' },
  { name: 'Spotify', wingetId: 'Spotify.Spotify', category: 'Multimedia' },
  { name: 'MPV', wingetId: 'mpv.net', category: 'Multimedia' },
  { name: 'HandBrake', wingetId: 'HandBrake.HandBrake', category: 'Multimedia' },
  { name: 'Audacity', wingetId: 'Audacity.Audacity', category: 'Multimedia' },
  { name: 'OBS Studio', wingetId: 'OBSProject.OBSStudio', category: 'Multimedia' },
  { name: 'K-Lite Codec Pack', wingetId: 'CodecGuide.K-LiteCodecPack.Standard', category: 'Multimedia' },
  { name: 'iTunes', wingetId: 'Apple.iTunes', category: 'Multimedia' },

  // Utilidades
  { name: '7-Zip', wingetId: '7zip.7zip', category: 'Utilidades' },
  { name: 'WinRAR', wingetId: 'RARLab.WinRAR', category: 'Utilidades' },
  { name: 'Everything', wingetId: 'voidtools.Everything', category: 'Utilidades' },
  { name: 'PowerToys', wingetId: 'Microsoft.PowerToys', category: 'Utilidades' },
  { name: 'ShareX', wingetId: 'ShareX.ShareX', category: 'Utilidades' },
  { name: 'CPU-Z', wingetId: 'CPUID.CPU-Z', category: 'Utilidades' },
  { name: 'HWMonitor', wingetId: 'CPUID.HWMonitor', category: 'Utilidades' },
  { name: 'CrystalDiskInfo', wingetId: 'CrystalDewWorld.CrystalDiskInfo', category: 'Utilidades' },
  { name: 'Rufus', wingetId: 'Rufus.Rufus', category: 'Utilidades' },
  { name: 'Ventoy', wingetId: 'Ventoy.Ventoy', category: 'Utilidades' },
  { name: 'Notepad++', wingetId: 'Notepad++.Notepad++', category: 'Utilidades' },
  { name: 'PDF24', wingetId: 'PDF24.PDF24', category: 'Utilidades' },
  { name: 'AnyDesk', wingetId: 'AnyDeskSoftwareGmbH.AnyDesk', category: 'Utilidades' },
  { name: 'TeamViewer', wingetId: 'TeamViewer.TeamViewer', category: 'Utilidades' },
  { name: 'qBittorrent', wingetId: 'qBittorrent.qBittorrent', category: 'Utilidades' },
  { name: 'AutoHotkey', wingetId: 'AutoHotkey.AutoHotkey', category: 'Utilidades' },

  // Desarrollo
  { name: 'VS Code', wingetId: 'Microsoft.VisualStudioCode', category: 'Desarrollo' },
  { name: 'Git', wingetId: 'Git.Git', category: 'Desarrollo' },
  { name: 'GitHub Desktop', wingetId: 'GitHub.GitHubDesktop', category: 'Desarrollo' },
  { name: 'Node.js LTS', wingetId: 'OpenJS.NodeJS.LTS', category: 'Desarrollo' },
  { name: 'Python 3', wingetId: 'Python.Python.3.12', category: 'Desarrollo' },
  { name: 'Java (Temurin 21)', wingetId: 'EclipseAdoptium.Temurin.21.JDK', category: 'Desarrollo' },
  { name: 'Docker Desktop', wingetId: 'Docker.DockerDesktop', category: 'Desarrollo' },
  { name: 'PowerShell 7', wingetId: 'Microsoft.PowerShell', category: 'Desarrollo' },
  { name: 'Windows Terminal', wingetId: 'Microsoft.WindowsTerminal', category: 'Desarrollo' },
  { name: 'Cursor', wingetId: 'Anysphere.Cursor', category: 'Desarrollo' },

  // Juegos
  { name: 'Steam', wingetId: 'Valve.Steam', category: 'Juegos' },
  { name: 'Epic Games', wingetId: 'EpicGames.EpicGamesLauncher', category: 'Juegos' },
  { name: 'GOG Galaxy', wingetId: 'GOG.Galaxy', category: 'Juegos' },
  { name: 'EA App', wingetId: 'ElectronicArts.EADesktop', category: 'Juegos' },
  { name: 'Ubisoft Connect', wingetId: 'Ubisoft.Connect', category: 'Juegos' },
  { name: 'Battle.net', wingetId: 'Blizzard.BattleNet', category: 'Juegos' },
  { name: 'Xbox App', wingetId: '9MV0B5HZVK9Z', category: 'Juegos' },
  { name: 'Riot Client', wingetId: 'RiotGames.RiotClient', category: 'Juegos' },

  // Microsoft
  { name: 'OneDrive', wingetId: 'Microsoft.OneDrive', category: 'Microsoft' },
  { name: 'Microsoft Edge WebView2', wingetId: 'Microsoft.EdgeWebView2Runtime', category: 'Microsoft' },
  { name: 'Visual C++ Runtimes (AIO)', wingetId: 'Microsoft.VCRedist.2015+.x64', category: 'Microsoft' },
  { name: '.NET Desktop Runtime 8', wingetId: 'Microsoft.DotNet.DesktopRuntime.8', category: 'Microsoft' },
  { name: 'DirectX Runtime', wingetId: 'Microsoft.DirectX', category: 'Microsoft' },
  { name: 'OneNote', wingetId: 'Microsoft.OneNote', category: 'Microsoft' },
  { name: 'Skype', wingetId: 'Microsoft.Skype', category: 'Microsoft' },
  { name: 'To Do', wingetId: 'Microsoft.Todos', category: 'Microsoft' },
];
