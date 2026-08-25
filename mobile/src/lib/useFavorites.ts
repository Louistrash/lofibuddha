import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getFavorites, getRecent, toggleFavorite } from "@/src/lib/favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getFavorites().then((f) => active && setFavorites(f));
      getRecent().then((r) => active && setRecent(r));
      return () => {
        active = false;
      };
    }, [])
  );

  const toggle = useCallback(async (id: string) => {
    setFavorites(await toggleFavorite(id));
  }, []);

  return { favorites, recent, toggle, isFavorite: (id: string) => favorites.includes(id) };
}
