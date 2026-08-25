import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lofibuddha_favorites";
const RECENT_KEY = "lofibuddha_recent";
const THEME_KEY = "lofibuddha_scene_theme";

export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await getFavorites();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function getRecent(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function pushRecent(id: string): Promise<string[]> {
  const current = await getRecent();
  const next = [id, ...current.filter((x) => x !== id)].slice(0, 20);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export async function getStoredSceneTheme(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export async function storeSceneTheme(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, id);
  } catch {
    // A lost preference is not worth interrupting playback for.
  }
}
