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
  addToQueue: (id: string) => void;
  removeFromQueue: (id: string) => void;
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

export function MusicProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>("home");
  const [appearance, setAppearance] = useState<Appearance>(rememberAppearance);
  const [current, setCurrent] = useState<Current | null>({ kind: "song", id: "s1" });
  const [playing, setPlaying] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [queue, setQueue] = useState<string[]>(songs.map((song) => song.id));
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
    } catch { /* optional storage */ }
  }, [favoriteSongs, favoriteStations]);

  const song = current?.kind === "song" ? songs.find((s) => s.id === current.id) ?? null : null;
  const station = current?.kind === "station" ? stations.find((s) => s.id === current.id) ?? null : null;

  const playSong = (id: string) => {
    if (!songs.some((s) => s.id === id)) return;
    setCurrent({ kind: "song", id });
    setPlaying(false); // UI preview only: no audio engine is connected.
  };
  const playStation = (id: string) => {
    if (!stations.some((s) => s.id === id)) return;
    setCurrent({ kind: "station", id });
    setPlaying(false); // UI preview only: no audio engine is connected.
  };
  const cycle = (direction: number) => {
    if (!song) return;
    const index = queue.indexOf(song.id);
    if (index < 0 || !queue.length) return;
    const nextIndex = (index + direction + queue.length) % queue.length;
    playSong(queue[nextIndex]);
  };
  const togglePlayback = () => setPlaying((value) => !value); // visual prototype state, not real audio
  const toggleFavoriteSong = (id: string) => setFavoriteSongs((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleFavoriteStation = (id: string) => setFavoriteStations((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const value = useMemo<MusicState>(() => ({
    tab, goTo: setTab, appearance, setAppearance,
    current, song, station, playing, playerOpen, setPlayerOpen,
    playSong, playStation, togglePlayback,
    next: () => cycle(1), previous: () => cycle(-1),
    queue, addToQueue: (id) => setQueue((old) => [...old, id]),
    removeFromQueue: (id) => setQueue((old) => old.filter((songId) => songId !== id)),
    favoriteSongs, favoriteStations, toggleFavoriteSong, toggleFavoriteStation,
  }), [tab, appearance, current, song, station, playing, playerOpen, queue, favoriteSongs, favoriteStations]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic(): MusicState {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}
