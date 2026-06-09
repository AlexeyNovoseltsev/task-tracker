import { api } from '@/lib/api';
import { isApiMode } from '@/lib/dataSync';
import type { FavoriteWithDetails, Project, Sprint, Task } from '@/types';

type FavoriteItemType = 'task' | 'project' | 'sprint';

export interface CachedFavorite {
  isFavorited: boolean;
  favoriteId: string | null;
}

type RawFavorite = FavoriteWithDetails & {
  item_type?: FavoriteItemType;
  item_id?: string;
  created_at?: string;
  updated_at?: string;
};

const favoritedByKey = new Map<string, string>();
let listPromise: Promise<FavoriteWithDetails[]> | null = null;
let cachedList: FavoriteWithDetails[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000;

export function favoriteCacheKey(itemType: FavoriteItemType, itemId: string): string {
  return `${itemType}:${itemId}`;
}

export function isFavoritesCacheReady(): boolean {
  return cachedList !== null;
}

export function getFavoriteFromCache(
  itemType: FavoriteItemType,
  itemId: string
): CachedFavorite | undefined {
  if (!isFavoritesCacheReady()) return undefined;

  const key = favoriteCacheKey(itemType, itemId);
  const favoriteId = favoritedByKey.get(key);
  if (favoriteId) {
    return { isFavorited: true, favoriteId };
  }
  return { isFavorited: false, favoriteId: null };
}

function normalizeFavorite(raw: RawFavorite): FavoriteWithDetails {
  const itemType = (raw.itemType ?? raw.item_type ?? 'task') as FavoriteItemType;
  const itemId = String(raw.itemId ?? raw.item_id ?? '');

  return {
    ...raw,
    itemType,
    itemId,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(raw.created_at ?? Date.now()),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(raw.updated_at ?? Date.now()),
    project: raw.project as Project | undefined,
    task: raw.task as Task | undefined,
    sprint: raw.sprint as Sprint | undefined,
  };
}

function syncIdCache(list: FavoriteWithDetails[]): void {
  favoritedByKey.clear();
  for (const fav of list) {
    if (fav.itemType && fav.itemId) {
      favoritedByKey.set(favoriteCacheKey(fav.itemType, fav.itemId), fav.id);
    }
  }
}

export function invalidateFavoritesList(): void {
  cachedList = null;
  cacheTimestamp = 0;
  listPromise = null;
}

export function setFavoriteInCache(
  itemType: FavoriteItemType,
  itemId: string,
  data: CachedFavorite
): void {
  const key = favoriteCacheKey(itemType, itemId);
  if (data.isFavorited && data.favoriteId) {
    favoritedByKey.set(key, data.favoriteId);
  } else {
    favoritedByKey.delete(key);
  }

  if (cachedList) {
    if (data.isFavorited && data.favoriteId) {
      const exists = cachedList.some((f) => f.id === data.favoriteId);
      if (!exists) invalidateFavoritesList();
    } else {
      cachedList = cachedList.filter((f) => f.itemId !== itemId || f.itemType !== itemType);
      cacheTimestamp = Date.now();
    }
  }
}

export function clearFavoritesCache(): void {
  favoritedByKey.clear();
  cachedList = null;
  cacheTimestamp = 0;
  listPromise = null;
}

/** Единая точка загрузки избранного — дедупликация параллельных запросов */
export async function fetchFavoritesList(force = false): Promise<FavoriteWithDetails[]> {
  if (!isApiMode()) return [];

  const cacheFresh = cachedList && Date.now() - cacheTimestamp < CACHE_TTL_MS;
  if (!force && cacheFresh) {
    return cachedList!;
  }

  if (listPromise) {
    return listPromise;
  }

  listPromise = (async () => {
    try {
      const data = await api.getFavorites() as RawFavorite[];
      const list = Array.isArray(data) ? data.map(normalizeFavorite) : [];
      cachedList = list;
      cacheTimestamp = Date.now();
      syncIdCache(list);
      return list;
    } catch (err) {
      invalidateFavoritesList();
      throw err;
    } finally {
      listPromise = null;
    }
  })();

  return listPromise;
}

export async function prefetchFavorites(): Promise<void> {
  try {
    await fetchFavoritesList();
  } catch {
    // prefetch не критичен — страница избранного повторит запрос
  }
}
