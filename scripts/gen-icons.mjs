/**
 * Generates icon-192.png, icon-512.png, and apple-touch-icon.png (180px)
 * from public/icon.svg using only Node.js built-ins (zlib + fs).
 *
 * The icons are solid #F2EAD6 with a simple ink stamp pattern — replace
 * public/icon.svg with any design you like and re-run to get proper PNGs.
 *
 * Usage:  node scripts/gen-icons.mjs
 */

import { createDeflateRaw } from 'zlib';
import { writeFileSync, readFileSync } from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import path from 'path';

const deflateRaw = promisify(createDeflateRaw);
const __dir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dir, '..', 'public');

// ── CRC-32 ───────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf  = Buffer.allocUnsafe(4); lenBuf.writeUInt32BE(data.length);
  const crcBuf  = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// ── Design: warm paper bg + vertical red band + ink characters (rects) ───────
function drawDesign(size) {
  const pixels = Buffer.alloc(size * size * 3);

  const paper  = [0xF2, 0xEA, 0xD6];
  const ink    = [0x1A, 0x14, 0x10];
  const red    = [0x8B, 0x1E, 0x16];
  const divider= [0xD8, 0xCA, 0xAA];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 3;
      pixels[i] = paper[0]; pixels[i+1] = paper[1]; pixels[i+2] = paper[2];
    }
  }

  const s = size / 512;

  // Top + bottom divider bars
  for (let y = Math.round(60*s); y < Math.round(64*s); y++)
    for (let x = Math.round(60*s); x < Math.round(452*s); x++) {
      const i=(y*size+x)*3; pixels[i]=divider[0];pixels[i+1]=divider[1];pixels[i+2]=divider[2];
    }
  for (let y = Math.round(448*s); y < Math.round(452*s); y++)
    for (let x = Math.round(60*s); x < Math.round(452*s); x++) {
      const i=(y*size+x)*3; pixels[i]=divider[0];pixels[i+1]=divider[1];pixels[i+2]=divider[2];
    }

  // Red accent square (centre-left, represents 宜/节气 badge)
  for (let y = Math.round(160*s); y < Math.round(340*s); y++)
    for (let x = Math.round(140*s); x < Math.round(200*s); x++) {
      const i=(y*size+x)*3; pixels[i]=red[0];pixels[i+1]=red[1];pixels[i+2]=red[2];
    }

  // Ink block (big date number area)
  for (let y = Math.round(100*s); y < Math.round(380*s); y++)
    for (let x = Math.round(220*s); x < Math.round(420*s); x++) {
      const fy = (y - 100*s) / (280*s);
      const fx = (x - 220*s) / (200*s);
      // Simple numeral approximation: thick vertical stroke
      if (fx > 0.35 && fx < 0.65) {
        const i=(y*size+x)*3; pixels[i]=ink[0];pixels[i+1]=ink[1];pixels[i+2]=ink[2];
      }
      // Top horizontal
      if (fy < 0.12 && fx > 0.1 && fx < 0.9) {
        const i=(y*size+x)*3; pixels[i]=ink[0];pixels[i+1]=ink[1];pixels[i+2]=ink[2];
      }
      // Bottom horizontal
      if (fy > 0.88 && fx > 0.1 && fx < 0.9) {
        const i=(y*size+x)*3; pixels[i]=ink[0];pixels[i+1]=ink[1];pixels[i+2]=ink[2];
      }
    }

  return pixels;
}

async function deflate(buf) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const d = createDeflateRaw({ level: 6 });
    d.on('data', c => chunks.push(c));
    d.on('end',  () => resolve(Buffer.concat(chunks)));
    d.on('error', reject);
    d.end(buf);
  });
}

async function makePNG(size) {
  const pixels = drawDesign(size);

  // PNG filter-0 scanlines
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size*3)] = 0; // filter: None
    pixels.copy(raw, y * (1 + size*3) + 1, y*size*3, (y+1)*size*3);
  }

  const compressed = await deflate(raw);

  const w = Buffer.allocUnsafe(4); w.writeUInt32BE(size);
  const h = Buffer.allocUnsafe(4); h.writeUInt32BE(size);
  const ihdrData = Buffer.concat([w, h, Buffer.from([8, 2, 0, 0, 0])]);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

(async () => {
  console.log('Generating icons…');
  const [p192, p512, p180] = await Promise.all([makePNG(192), makePNG(512), makePNG(180)]);
  writeFileSync(path.join(publicDir, 'icon-192.png'), p192);
  writeFileSync(path.join(publicDir, 'icon-512.png'), p512);
  writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), p180);
  console.log('Done — icon-192.png, icon-512.png, apple-touch-icon.png written to public/');
  console.log('Tip: for a nicer icon, open public/icon.svg in Inkscape/Figma, export as PNG, and replace these files.');
})();
