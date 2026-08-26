// ============================================
// Configuración central de SamirTechTools
// Todas las URLs y rutas del sistema en un solo lugar
// ============================================

export const APP_VERSION = '1.0.0';

// --- Rutas del sistema ---
export const PATHS = {
  OFFICE_DIR: 'C:\\Office',
  OFFICE_ISO_DIR: 'C:\\OfficeISO',
} as const;

// --- Microsoft Office ---
export const OFFICE = {
  SETUP_URL: 'https://officecdn.microsoft.com/pr/wsus/setup.exe',

  // Office 2016 Professional Plus 32-bit (ZIP en Mediafire, se extrae al Escritorio)
  OFFICE_2016: {
    name: 'Office 2016 Professional Plus (32-bit)',
    url: 'https://download1325.mediafire.com/5zv2bk3bb0egc4SPwWu8P6CZKojgct7P6TO0W4qFfOfNcUs78vr4RCLGHEdmGFPTFOrYMi71N8DgFpw7cWkYaAbK4DkQ2SPXF1OqguZG5lYXmO2kfJM1ey2EKZ1poXS7-17rUi3BjiMQDuJ323Z86_RK9VOGerQ18LVaGEb8QtNl28hO/vfmqp5ciu1c1bmr/Office_Professional_Plus_2016_32bits_Spanish.zip',
    zipName: 'Office_Professional_Plus_2016_32bits_Spanish.zip',
    innerFolder: 'Office_Professional_Plus_2016_32bits_Spanish',
    size: '~720 MB',
  },

  // Configuraciones XML por versión (64-bit, es-mx, clave KMS incorporada)
  ONLINE_VERSIONS: [
    {
      id: '365',
      name: 'Microsoft 365 Apps',
      xml: `<Configuration>
  <Add OfficeClientEdition="64" Channel="Current">
    <Product ID="O365ProPlusRetail">
      <Language ID="es-mx" />
    </Product>
  </Add>
  <Display Level="Full" AcceptEULA="TRUE" />
  <Property Name="AUTOACTIVATE" Value="1" />
</Configuration>`,
    },
    {
      id: '2024',
      name: 'Office LTSC 2024 Perpetual Enterprise',
      xml: `<Configuration ID="a206ca65-3341-4e3c-98f7-cf8ed6bc11e9">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2024">
    <Product ID="ProPlus2024Volume" PIDKEY="XJ2XN-FW8RK-P4HMP-DKDBV-GCVGB">
      <Language ID="es-mx" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
    },
    {
      id: '2021',
      name: 'Office LTSC 2021 Perpetual Enterprise',
      xml: `<Configuration ID="ee1dc980-bb74-4ca7-bb04-8ec42f6aec1f">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2021">
    <Product ID="ProPlus2021Volume" PIDKEY="FXYTK-NJJ8C-GB6DW-3DYQT-6F7TH">
      <Language ID="es-mx" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
    },
    {
      id: '2019',
      name: 'Office 2019 Perpetual Enterprise',
      xml: `<Configuration ID="4f0bc6ac-9932-4b5e-9495-003a7649d0eb">
  <Add OfficeClientEdition="64" Channel="PerpetualVL2019">
    <Product ID="ProPlus2019Volume" PIDKEY="NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP">
      <Language ID="es-mx" />
      <ExcludeApp ID="Groove" />
      <ExcludeApp ID="Lync" />
    </Product>
  </Add>
  <Property Name="SharedComputerLicensing" Value="0" />
  <Property Name="FORCEAPPSHUTDOWN" Value="FALSE" />
  <Property Name="DeviceBasedLicensing" Value="0" />
  <Property Name="SCLCacheOverride" Value="0" />
  <Property Name="AUTOACTIVATE" Value="1" />
  <Updates Enabled="TRUE" />
  <RemoveMSI />
</Configuration>`,
    },
  ] as const,

  // ISOs offline (descarga directa desde Microsoft)
  OFFLINE_VERSIONS: [
    { id: '365', name: 'Microsoft 365 Apps', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=O365ProPlusRetail&platform=x64&language=es-mx&version=O16GA' },
    { id: '2024', name: 'Office LTSC 2024 Plus', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2024Retail&platform=x64&language=es-mx&version=O16GA' },
    { id: '2021', name: 'Office LTSC 2021 Plus', url: 'https://c2rsetup.officeapps.live.com/c2r/download.aspx?ProductreleaseID=ProPlus2021Retail&platform=x64&language=es-mx&version=O16GA' },
    { id: '2019', name: 'Office 2019 Plus', url: 'https://officecdn.microsoft.com/db/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/ProfessionalPlus2019.img' },
  ] as const,
} as const;

// --- Herramientas externas ---
export const TOOLS = {
  // MAS interactivo: abre el menú para elegir método manualmente
  MAS_CMD:
    'powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList \'-NoProfile -ExecutionPolicy Bypass -Command irm https://get.activated.win | iex\'"',
  CTT_CMD:
    'powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList \'-NoProfile -ExecutionPolicy Bypass -Command irm https://christitus.com/win | iex\'"',
  URLS: {
    MASSGRAVE: 'https://massgrave.dev',
    CHRISTITUS: 'https://christitus.com',
    WINUTIL_GITHUB: 'https://github.com/ChrisTitusTech/winutil',
  },
} as const;
