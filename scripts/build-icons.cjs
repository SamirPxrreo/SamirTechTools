// Regenera public/icon.png (512) y public/icon.ico (10 tamaños 16-256) a partir de public/icon.svg, con fondo transparente.
// Uso (desde la raíz):
//   npm install --no-save sharp          (no se guarda en package.json; solo se necesita para esto)
//   node scripts/build-icons.cjs         (o:  node scripts/build-icons.cjs ruta/icon.svg carpeta-salida)
// El ICO debe incluir 256 px (lo exige electron-builder). Los tamaños se guardan como PNG con alfa.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const svgPath = process.argv[2] || path.join(root, 'public', 'icon.svg');
const outDir = process.argv[3] || path.join(root, 'public');
const SIZES = [16, 20, 24, 32, 40, 48, 64, 96, 128, 256];
const svg = fs.readFileSync(svgPath);

const render = (s) => sharp(svg, { density: Math.max(72, Math.round((72 * s * 16) / 512)) })
  .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 }).toBuffer();

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'icon.png'), await sharp(svg, { density: 384 }).resize(512, 512).png({ compressionLevel: 9 }).toBuffer());

  const imgs = [];
  for (const s of SIZES) imgs.push({ s, buf: await render(s) });
  const head = Buffer.alloc(6);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let offset = 6 + 16 * imgs.length;
  const dir = imgs.map(({ s, buf }) => {
    const e = Buffer.alloc(16);
    e[0] = s >= 256 ? 0 : s; e[1] = s >= 256 ? 0 : s;
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
    e.writeUInt32LE(buf.length, 8); e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });
  fs.writeFileSync(path.join(outDir, 'icon.ico'), Buffer.concat([head, ...dir, ...imgs.map(i => i.buf)]));

  // Comprobación: las esquinas de cada tamaño deben ser transparentes (alfa 0)
  const ico = fs.readFileSync(path.join(outDir, 'icon.ico'));
  for (let i = 0; i < ico.readUInt16LE(4); i++) {
    const o = 6 + 16 * i;
    const { data, info } = await sharp(ico.subarray(ico.readUInt32LE(o + 12), ico.readUInt32LE(o + 12) + ico.readUInt32LE(o + 8))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (data[3] !== 0) throw new Error(`El icono de ${info.width}px NO es transparente en la esquina`);
  }
  console.log('OK: icon.png + icon.ico generados en', outDir, '(esquinas transparentes en todos los tamaños)');
})();
