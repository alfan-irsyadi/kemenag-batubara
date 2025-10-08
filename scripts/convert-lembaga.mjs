import fs from 'node:fs/promises';
import path from 'node:path';
import xlsx from 'xlsx';

// Allowed public columns
const PUBLIC_COLUMNS = [
  'NSM',
  'NPSN',
  'Nama Madrasah',
  'Jenjang',
  'Status',
  'Provinsi',
  'Kabupaten',
  'Kecamatan',
  'Alamat',
  'Afiliasi Organisasi'
];

// Normalize sheet name to standard Jenjang label
function normalizeJenjang(sheetName) {
  if (!sheetName) return 'Tidak Ditentukan';
  const s = String(sheetName).trim().toLowerCase();
  if (s === 'ra') return 'RA';
  if (s === 'mi') return 'MI';
  if (s === 'mts' || s === 'mt s' || s === 'mt.s') return 'MTs';
  if (s === 'ma') return 'MA';
  return sheetName; // fallback to original
}

function isTargetSheet(sheetName) {
  const s = String(sheetName).trim().toLowerCase();
  return s === 'ra' || s === 'mi' || s === 'mts' || s === 'mt s' || s === 'mt.s' || s === 'ma';
}

function pickPublic(row, sheetName) {
  const out = {};
  for (const key of PUBLIC_COLUMNS) {
    if (Object.prototype.hasOwnProperty.call(row, key)) {
      out[key] = row[key];
    }
  }
  // Ensure Jenjang is present; fill from sheet name if missing
  if (out['Jenjang'] == null || out['Jenjang'] === '') {
    out['Jenjang'] = normalizeJenjang(sheetName);
  }
  return out;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  try {
    const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(process.cwd(), 'Daftar_Lembaga.xlsx');
    const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : path.resolve(process.cwd(), 'public', 'data', 'Daftar_Lembaga.json');

    const wb = xlsx.readFile(inputPath, { cellDates: false });
    const results = [];

    for (const sheetName of wb.SheetNames) {
      if (!isTargetSheet(sheetName)) continue;
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;

      const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
      for (const row of rows) {
        const pub = pickPublic(row, sheetName);
        // Skip empty rows (no NSM and NPSN and Nama Madrasah)
        const hasId = (pub['NSM'] && String(pub['NSM']).trim()) || (pub['NPSN'] && String(pub['NPSN']).trim()) || (pub['Nama Madrasah'] && String(pub['Nama Madrasah']).trim());
        if (!hasId) continue;
        results.push(pub);
      }
    }

    await ensureDir(outputPath);
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf8');

    console.log(`Converted ${results.length} rows to: ${outputPath}`);
  } catch (err) {
    console.error('Conversion failed:', err);
    process.exitCode = 1;
  }
}

main();
