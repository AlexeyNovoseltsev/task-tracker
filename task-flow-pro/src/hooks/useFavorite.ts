import { useCallback, useEffect, useState } from 'react';



import { useToast } from '@/hooks/useToast';

import { ApiError } from '@/lib/api';

import { api } from '@/lib/api';

import {

  getFavoriteFromCache,

  isFavoritesCacheReady,

  prefetchFavorites,

  invalidateFavoritesList,
  setFavoriteInCache,

} from '@/lib/favoritesCache';

import { isApiMode, isUuid } from '@/lib/dataSync';



type FavoriteItemType = 'task' | 'project' | 'sprint';



const ADDED_MSG: Record<FavoriteItemType, (name: string) => string> = {

  task: (n) => `${n} добавлена в избранное`,

  project: (n) => `${n} добавлен в избранное`,

  sprint: (n) => `${n} добавлен в избранное`,

};



const REMOVED_MSG: Record<FavoriteItemType, (name: string) => string> = {

  task: (n) => `${n} убрана из избранного`,

  project: (n) => `${n} убран из избранного`,

  sprint: (n) => `${n} убран из избранного`,

};



interface UseFavoriteOptions {

  itemType: FavoriteItemType;

  itemId: string;

  itemTitle?: string;

}



function readCachedState(itemType: FavoriteItemType, itemId: string) {

  const cached = getFavoriteFromCache(itemType, itemId);

  if (!cached) return null;

  return { isFavorited: cached.isFavorited, favoriteId: cached.favoriteId };

}



export function useFavorite({ itemType, itemId, itemTitle }: UseFavoriteOptions) {

  const { success, error } = useToast();

  const initial = readCachedState(itemType, itemId);



  const [isFavorited, setIsFavorited] = useState(initial?.isFavorited ?? false);

  const [favoriteId, setFavoriteId] = useState<string | null>(initial?.favoriteId ?? null);

  const [isLoading, setIsLoading] = useState(false);

  const [isChecking, setIsChecking] = useState(false);

  const [justAdded, setJustAdded] = useState(false);



  const canFavorite = isApiMode() && isUuid(itemId);



  const applyCacheState = useCallback(() => {

    const cached = readCachedState(itemType, itemId);

    if (!cached) return false;

    setIsFavorited(cached.isFavorited);

    setFavoriteId(cached.favoriteId);

    return true;

  }, [itemType, itemId]);



  const checkStatusRemote = useCallback(async () => {

    if (!canFavorite) {

      setIsFavorited(false);

      setFavoriteId(null);

      return;

    }



    if (isFavoritesCacheReady()) {

      applyCacheState();

      return;

    }



    setIsChecking(true);

    try {

      const data = await api.checkIfFavorited(itemType, itemId) as {

        is_favorited: boolean;

        favorite?: { id: string } | null;

      };

      const next = {

        isFavorited: Boolean(data?.is_favorited),

        favoriteId: data?.favorite?.id || null,

      };

      setIsFavorited(next.isFavorited);

      setFavoriteId(next.favoriteId);

      setFavoriteInCache(itemType, itemId, next);

    } catch {

      setIsFavorited(false);

      setFavoriteId(null);

    } finally {

      setIsChecking(false);

    }

  }, [applyCacheState, canFavorite, itemType, itemId]);



  useEffect(() => {

    if (!canFavorite) return;



    if (applyCacheState()) return;



    void prefetchFavorites().then(() => {

      if (applyCacheState()) return;

      if (isFavoritesCacheReady()) {

        setIsFavorited(false);

        setFavoriteId(null);

        return;

      }

      void checkStatusRemote();

    });

  }, [canFavorite, applyCacheState, checkStatusRemote, itemType, itemId]);



  const toggle = useCallback(async () => {

    if (!canFavorite || isLoading) return;



    setIsLoading(true);

    const name = itemTitle ? `«${itemTitle}»` : 'Элемент';



    try {

      if (isFavorited && favoriteId) {

        await api.removeFromFavorites(favoriteId);

        setIsFavorited(false);

        setFavoriteId(null);

        setFavoriteInCache(itemType, itemId, { isFavorited: false, favoriteId: null });
        invalidateFavoritesList();

        setJustAdded(false);

        success('Убрано из избранного', REMOVED_MSG[itemType](name));

      } else {

        const created = await api.addToFavorites({ itemType, itemId }) as { id: string };

        setIsFavorited(true);

        setFavoriteId(created.id);

        setFavoriteInCache(itemType, itemId, { isFavorited: true, favoriteId: created.id });
        invalidateFavoritesList();

        setJustAdded(true);

        success('В избранном ✨', ADDED_MSG[itemType](name));

        setTimeout(() => setJustAdded(false), 700);

      }

    } catch (err) {

      const message = err instanceof ApiError

        ? err.message

        : 'Не удалось обновить избранное';

      error('Ошибка избранного', message);

    } finally {

      setIsLoading(false);

    }

  }, [canFavorite, isLoading, isFavorited, favoriteId, itemType, itemId, itemTitle, success, error]);



  const tooltip = !canFavorite

    ? 'Избранное доступно только для задач из облака'

    : isFavorited

      ? 'Убрать из избранного'

      : 'Добавить в избранное';



  return {

    isFavorited,

    isLoading,

    isChecking: isChecking && !isFavoritesCacheReady(),

    canFavorite,

    justAdded,

    toggle,

    tooltip,

  };

}

