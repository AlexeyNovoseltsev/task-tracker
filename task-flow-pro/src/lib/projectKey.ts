const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function transliterate(value: string): string {
  return value
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');
}

function randomKeySuffix(length: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

/** Генерирует валидный ключ проекта (2–10 заглавных латинских букв). */
export function generateProjectKey(name: string): string {
  const fromName = transliterate(name)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/[^A-Z]/g, '').slice(0, 3))
    .join('')
    .slice(0, 10);

  if (/^[A-Z]{2,10}$/.test(fromName)) {
    return fromName;
  }

  return `PR${randomKeySuffix(Math.max(2, 6 - 2))}`.slice(0, 10);
}
