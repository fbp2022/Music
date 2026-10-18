import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { songs, stations } from "../data/demo";
import type { Appearance, Song, Station, Tab } from "../types/music";

type Current = { kind: "song" | "station"; id: string };

interface MusicState {
  tab: Tab;
  goTo: (tab: Tab) => void;
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
  current: Current | null;
  song: Song | null;
  station: Station | null;
  playing: boolean;
  playerOpen: boolean;
  setPlayerOpen: (value: boolean) => void;
  playSong: (id: string) => void;
  playStation: (id: string) => void;
  togglePlayback: () => void;
  next: () => void;
  previous: () => void;
  queue: string[];
  playNext: (id: string) => void;
  playLater: (id: string) => void;
  moveInQueue: (id: string, direction: -1 | 1) => void;
  clearUpNext: () => void;
  canUndoQueue: boolean;
  undoQueue: () => void;
  favoriteSongs: string[];
  favoriteStations: string[];
  toggleFavoriteSong: (id: string) => void;
  toggleFavoriteStation: (id: string) => void;
}

const MusicContext = createContext<MusicState | null>(null);

function rememberList(key: string, fallback: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : fallback;
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function rememberAppearance(): Appearance {
  try {
    const value = localStorage.getItem("fm-theme");
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch {
    return "system";
  }
}

const knownSongIds = new Set(songs.map((s) => s.id));
function rememberQueue() {
  const ids = rememberList("fm-demo-queue", songs.map((s) => s.id));
  const valid = [...new Set(ids.filter((id) => knownSongIds.has(id)))];
  return valid.length ? valid : songs.map((s) => s.id);
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("home");
  const [appearance, setAppearance] = useState<Appearance>(rememberAppearance);
  const [current, setCurrent] = useState<Current | null>({ kind: "song", id: "s1" });
  const [playing, setPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [queue, setQueue] = useState<string[]>(rememberQueue);
  const [previousQueue, setPreviousQueue] = useState<string[] | null>(null);
  const [favoriteSongs, setFavoriteSongs] = useState<string[]>(() => rememberList("fm-song-favorites", ["s1"]));
  const [favoriteStations, setFavoriteStations] = useState<string[]>(() => rememberList("fm-station-favorites", ["r1"]));

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme = appearance === "system" ? (media.matches ? "dark" : "light") : appearance;
      document.documentElement.style.colorScheme = appearance === "system" ? (media.matches ? "dark" : "light") : appearance;
    };
    apply();
    try { localStorage.setItem("fm-theme", appearance); } catch { /* optional storage */ }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance]);

  useEffect(() => {
    try {
      localStorage.setItem("fm-song-favorites", JSON.stringify(favoriteSongs));
      localStorage.setItem("fm-station-favorites", JSON.stringify(favoriteStations));
      localStorage.setItem("fm-demo-queue", JSON.stringify(queue));
    } catch { /* optional storage */ }
  }, [favoriteSongs, favoriteStations, queue]);

  const song = current?.kind === "song" ? songs.find((s) => s.id === current.id) ?? null : null;
  const station = current?.kind === "station" ? stations.find((s) => s.id === current.id) ?? null : null;

  const playSong = (id: string) => {
    if (!knownSongIds.has(id)) return;
    setCurrent({ kind: "song", id });
    setQueue((prev) => prev.includes(id) ? prev : [id, ...prev]);
    setPlaying(false); // No audio element until Navidrome is connected.
  };
  const playStation = (id: string) => {
    if (!stations.some((s) => s.id === id)) return;
    setCurrent({ kind: "station", id });
    setPlaying(false); // Radio streams not connected yet.
  };
  const cycle = (direction: number) => {
    if (!song) return;
    const index = queue.indexOf(song.id);
    if (index < 0 || !queue.length) return;
    const nextIndex = (index + direction + queue.length) % queue.length;
    playSong(queue[nextIndex]);
  };
  const togglePlayback = () => setPlaying((value) => !value); // Visual preview only.

  const changeQueue = (next: string[]) => {
    if (next.join("|") === queue.join("|")) return;
    setPreviousQueue(queue);
    setQueue(next);
  };
  const playNext = (id: string) => {
    if (!knownSongIds.has(id) || song?.id === id) return;
    const remaining = queue.filter((queued) => queued !== id);
    const currentPosition = song ? remaining.indexOf(song.id) : -1;
    remaining.splice(currentPosition + 1, 0, id);
    changeQueue(remaining);
  };
  const playLater = (id: string) => {
    if (!knownSongIds.has(id) || song?.id === id) return;
    changeQueue([...queue.filter((queued) => queued !== id), id]);
  };
  const moveInQueue = (id: string, direction: -1 | 1) => {
    if (id === song?.id) return;
    const currentIndex = queue.indexOf(id);
    const destination = currentIndex + direction;
    if (currentIndex < 0 || destination < 0 || destination >= queue.length || queue[destination] === song?.id) return;
    const nextQueue = [...queue];
    [nextQueue[currentIndex], nextQueue[destination]] = [nextQueue[destination], nextQueue[currentIndex]];
    changeQueue(nextQueue);
  };
  const clearUpNext = () => changeQueue(song ? [song.id] : []);
  const undoQueue = () => {
    if (previousQueue === null) return;
    setQueue(previousQueue);
    setPreviousQueue(null);
  };
  const toggleFavoriteSong = (id: string) => setFavoriteSongs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleFavoriteStation = (id: string) => setFavoriteStations((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const value = useMemo<MusicState>(() => ({
    tab, goTo: setTab, appearance, setAppearance,
    current, song, station, playing, playerOpen, setPlayerOpen,
    playSong, playStation, togglePlayback,
    next: () => cycle(1), previous: () => cycle(-1),
    queue, playNext, playLater, moveInQueue, clearUpNext,
    canUndoQueue: previousQueue !== null, undoQueue,
    favoriteSongs, favoriteStations, toggleFavoriteSong, toggleFavoriteStation,
  }), [tab, appearance, current, song, station, playing, playerOpen, queue, previousQueue, favoriteSongs, favoriteStations]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicState {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}
