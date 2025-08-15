import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import {
  getFile,
  getImages,
  findNodesByType,
  download,
  slugify,
  FigmaNode,
} from './figmaClient';

async function main() {
  console.log('Starting Figma pull script...');
  console.log('Environment variables:');
  console.log('FIGMA_TOKEN:', process.env.FIGMA_TOKEN ? 'SET' : 'NOT SET');
  console.log('FILE_KEY:', process.env.FILE_KEY || 'NOT SET');
  console.log('CLI args:', process.argv.slice(2));
  
  const fileKey = process.env.FILE_KEY || process.argv[2];
  if (!fileKey) throw new Error('Pass FILE_KEY in .env or as CLI arg');

  const file = await getFile(fileKey);
  console.log(`File: ${file.name}`);
  console.log(`Last modified: ${file.lastModified}`);

  // Сохраним «сырой» JSON локально — удобно для подсказок Cursor и ручного анализа
  await fs.promises.mkdir('figma-cache', { recursive: true });
  await fs.promises.writeFile(
    path.join('figma-cache', `${fileKey}.json`),
    JSON.stringify(file, null, 2)
  );

  // Найдём все фреймы (FRAME) — можно заменить на COMPONENT/INSTANCE и т.п.
  const frames = findNodesByType(file.document as FigmaNode, 'FRAME');
  if (frames.length === 0) {
    console.log('Нет фреймов для экспорта. Проверь типы узлов.');
    return;
  }
  console.log(`Frames: ${frames.length}`);

  // Бэтчим ids по 50 — безопасно для query length
  const batchSize = 50;
  for (let i = 0; i < frames.length; i += batchSize) {
    const batch = frames.slice(i, i + batchSize);
    const ids = batch.map((f) => f.id);
    const images = await getImages(fileKey, ids, { format: 'png', scale: 2 });

    for (const f of batch) {
      const url = images[f.id];
      if (!url) {
        console.warn(`No image URL for frame ${f.name} (${f.id})`);
        continue;
      }
      const outPath = path.join('exports', `${slugify(f.name)}.png`);
      await download(url, outPath);
      console.log('✓', outPath);
    }
  }

  console.log('\nDone. PNG-экспорты лежат в ./exports. Сырой JSON — в ./figma-cache');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});