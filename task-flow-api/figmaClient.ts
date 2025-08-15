import fs from 'node:fs';
import path from 'node:path';

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

export type FigmaFileResponse = {
  name: string;
  document: FigmaNode;
  lastModified: string;
  thumbnailUrl?: string;
  version?: string;
};

export const FIGMA_API = 'https://api.figma.com/v1';

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Env ${name} is required`);
  return v;
}

async function api<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
  const url = `${FIGMA_API}${endpoint}${params ? `?${params}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'X-Figma-Token': requiredEnv('FIGMA_TOKEN'),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API ${endpoint} failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getFile(fileKey: string): Promise<FigmaFileResponse> {
  return api(`/files/${fileKey}`);
}

export async function getImages(
  fileKey: string,
  ids: string[],
  opts?: { format?: 'png' | 'svg' | 'pdf'; scale?: number }
): Promise<Record<string, string>> {
  const params = new URLSearchParams();
  params.set('ids', ids.join(','));
  if (opts?.format) params.set('format', opts.format);
  if (opts?.scale) params.set('scale', String(opts.scale));
  const data = await api<{ images: Record<string, string> }>(`/images/${fileKey}`, params);
  return data.images;
}

export function walk(node: FigmaNode, visit: (n: FigmaNode) => void) {
  visit(node);
  node.children?.forEach((c) => walk(c, visit));
}

export function findNodesByType(root: FigmaNode, type: string): FigmaNode[] {
  const out: FigmaNode[] = [];
  walk(root, (n) => {
    if (n.type === type) out.push(n);
  });
  return out;
}

export async function download(url: string, outFile: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  await fs.promises.mkdir(path.dirname(outFile), { recursive: true });
  
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(outFile, buffer);
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\-\s_]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
