import { api } from "@/src/theme/tokens";

export function audioUrl(kind: "sounds" | "music-tracks" | "meditations" | "focus" | "breathe" | "affirmations", id: string) {
  const base = api.baseUrl.replace(/\/$/, "");
  if (kind === "sounds") return `${base}/api/sounds/audio/${id}.mp3`;
  if (kind === "music-tracks") return `${base}/api/music-tracks/audio/${id}.mp3`;
  if (kind === "meditations") return `${base}/api/meditations/audio/${id}.mp3`;
  if (kind === "focus") return `${base}/api/focus/audio/${id}.mp3`;
  if (kind === "affirmations") return `${base}/api/affirmations/audio/${id}.mp3`;
  return `${base}/api/breathe/audio/${id}.mp3`;
}

/** Duck-timeline URL for a guided meditation (pauses where music returns). */
export function duckUrl(guide: string) {
  return `${api.baseUrl.replace(/\/$/, "")}/api/meditations/duck/${guide}`;
}

/** Cover-art URL for a music track (large, shareable version). */
export function coverUrl(cover: string) {
  return `${api.baseUrl.replace(/\/$/, "")}/images/music-covers/${cover}.webp`;
}

/** Small cover-art URL for playlist thumbnails. */
export function thumbUrl(cover: string) {
  return `${api.baseUrl.replace(/\/$/, "")}/images/music-covers/thumbs/${cover}.webp`;
}

export async function apiFetch(path: string, init: RequestInit = {}, fbUid?: string | null) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (fbUid) headers.set("x-fb-uid", fbUid);
  return fetch(`${api.baseUrl.replace(/\/$/, "")}${path}`, { ...init, headers });
}
