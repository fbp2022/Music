import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { songs } from "../data/demo";
import { readLocalStations, reportStationListen, stationFromManualEntry } from "../services/radioBrowser";
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
  playbackError: string | null;
  playerOpen: boolean;
  setPlayerOpen: (value: boolean) => void;
  playSong: (id: string) => void;
  playStation: (station: Station) => void;
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
  favoriteStationRecords: Station[];
  customStations: Station[];
  radioStations: Station[];
  addRadioResults: (stations: Station[]) => void;
  addCustomStation: (name: string, url: string, genre: string) => void;
  removeCustomStation: (id: string) => void;
  toggleFavoriteSong: (id: string) => void;
  toggleFavoriteStation: (id: string) => void;
}

const MusicContext = createContext<MusicState | null>(null);

function readList(key: string, fallback: string[]): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return Array.isArray(raw) && raw.every((s) => typeof s === "string") ? raw : fallback;
  } catch { return fallback; }
}

function readFavorites(): Station[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem("fm-radio-favorites-v2") || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is Station => Boolean(item) &&
      typeof item.id === "string" && typeof item.name === "string" &&
      typeof item.streamUrl === "string" && item.streamUrl.startsWith("https://")
    ).slice(0, 150);
  } catch { return []; }
}

function readAppearance(): Appearance {
  try {
    const value = localStorage.getItem("fm-theme");
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  } catch { return "system"; }
}

const validSongs = new Set(songs.map((s) => s.id));
function readQueue() {
  const ids = readList("fm-demo-queue", songs.map((s) => s.id));
  const clean = [...new Set(ids.filter((id) => validSongs.has(id)))];
  return clean.length ? clean : songs.map((s) => s.id);
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);
  const [current, setCurrent] = useState<Current | null>({ kind: "song", id: "s1" });
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [queue, setQueue] = useState<string[]>(readQueue);
  const [previousQueue, setPreviousQueue] = useState<string[] | null>(null);
  const [favoriteSongs, setFavoriteSongs] = useState(() => readList("fm-song-favorites", ["s1"]));
  const [favoriteStationRecords, setFavoriteStationRecords] = useState<Station[]>(readFavorites);
  const [customStations, setCustomStations] = useState<Station[]>(readLocalStations);
  const [radioStations, setRadioStations] = useState<Station[]>([]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = appearance === "system" ? (media.matches ? "dark" : "light") : appearance;
      document.documentElement.dataset.theme = mode;
      document.documentElement.style.colorScheme = mode;
    };
    apply();
    try { localStorage.setItem("fm-theme", appearance); } catch { /* optional */ }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [appearance]);

  useEffect(() => {
    try {
      localStorage.setItem("fm-song-favorites", JSON.stringify(favoriteSongs));
      localStorage.setItem("fm-radio-favorites-v2", JSON.stringify(favoriteStationRecords));
      localStorage.setItem("fm-custom-radio", JSON.stringify(customStations));
      localStorage.setItem("fm-demo-queue", JSON.stringify(queue));
    } catch { /* Local persistence is best effort until accounts are connected. */ }
  }, [favoriteSongs, favoriteStationRecords, customStations, queue]);

  const song = current?.kind === "song" ? songs.find((s) => s.id === current.id) ?? null : null;
  const station = current?.kind === "station" ? activeStation : null;
  const favoriteStations = useMemo(() => favoriteStationRecords.map((s) => s.id), [favoriteStationRecords]);

  const pauseRadio = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "none";
  };

  const playSong = (id: string) => {
    if (!validSongs.has(id)) return;
    pauseRadio();
    setActiveStation(null);
    setPlaybackError(null);
    setCurrent({ kind: "song", id });
    setQueue((prev) => prev.includes(id) ? prev : [id, ...prev]);
    setPlaying(false); // Song playback awaits Navidrome integration.
  };

  const playStation = (selection: Station) => {
    if (!selection.streamUrl.startsWith("https://")) {
      setPlaybackError("This station does not provide a secure HTTPS stream.");
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent({ kind: "station", id: selection.id });
    setActiveStation(selection);
    setPlaybackError(null);
    setPlaying(false);
    audio.pause();
    audio.src = selection.streamUrl;
    audio.load();
    if ("mediaSession" in navigator && typeof MediaMetadata !== "undefined") {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: selection.name,
          artist: "Live radio",
          album: selection.country || "Internet radio",
          artwork: selection.cover.startsWith("https://") ? [{ src: selection.cover }] : [],
        });
      } catch { /* Metadata is optional and must never prevent playback. */ }
    }
    // Call play() during the originating tap/click (important on iOS).
    void audio.play().catch(() => {
      setPlaying(false);
      setPlaybackError("This station couldn't play. Try another station or check its stream format.");
    });
    if (selection.source === "radio-browser") reportStationListen(selection.id);
  };

  const togglePlayback = () => {
    if (current?.kind === "station") {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        setPlaybackError(null);
        void audio.play().catch(() => setPlaybackError("Unable to resume this station. Try selecting it again."));
      } else audio.pause();
      return;
    }
    // Existing song controls are only a UI preview until Navidrome is integrated.
    setPlaying((value) => !value);
  };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler("play", () => { if (audioRef.current?.src) void audioRef.current.play().catch(() => undefined); });
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("stop", () => audioRef.current?.pause());
    } catch { /* Some iOS versions do not expose all media session actions. */ }
  }, []);

  const cycle = (direction: number) => {
    if (!song) return;
    const index = queue.indexOf(song.id);
    if (index < 0 || !queue.length) return;
    playSong(queue[(index + direction + queue.length) % queue.length]);
  };

  const changeQueue = (next: string[]) => {
    if (next.join("|") === queue.join("|")) return;
    setPreviousQueue(queue);
    setQueue(next);
  };
  const playNext = (id: string) => {
    if (!validSongs.has(id) || song?.id === id) return;
    const remaining = queue.filter((s) => s !== id);
    remaining.splice((song ? remaining.indexOf(song.id) : -1) + 1, 0, id);
    changeQueue(remaining);
  };
  const playLater = (id: string) => {
    if (!validSongs.has(id) || song?.id === id) return;
    changeQueue([...queue.filter((s) => s !== id), id]);
  };
  const moveInQueue = (id: string, direction: -1 | 1) => {
    if (id === song?.id) return;
    const from = queue.indexOf(id), to = from + direction;
    if (from < 0 || to < 0 || to >= queue.length || queue[to] === song?.id) return;
    const next = [...queue];
    [next[from], next[to]] = [next[to], next[from]];
    changeQueue(next);
  };
  const clearUpNext = () => changeQueue(song ? [song.id] : []);
  const undoQueue = () => {
    if (previousQueue === null) return;
    setQueue(previousQueue);
    setPreviousQueue(null);
  };

  const addRadioResults = useCallback((entries: Station[]) => setRadioStations((prev) => {
    const all = new Map(prev.map((station) => [station.id, station]));
    for (const entry of entries) all.set(entry.id, entry);
    return [...all.values()].slice(-600);
  }), []);

  const addCustomStation = (name: string, url: string, genre: string) => {
    const entry = stationFromManualEntry(name, url, genre);
    setCustomStations((prev) => [entry, ...prev]);
    setRadioStations((prev) => [entry, ...prev]);
  };
  const removeCustomStation = (id: string) => {
    setCustomStations((prev) => prev.filter((entry) => entry.id !== id));
    setFavoriteStationRecords((prev) => prev.filter((entry) => entry.id !== id));
  };
  const toggleFavoriteStation = (id: string) => {
    const entry = [activeStation, ...radioStations, ...customStations, ...favoriteStationRecords]
      .find((item) => item?.id === id);
    if (!entry) return;
    setFavoriteStationRecords((prev) => prev.some((s) => s.id === id)
      ? prev.filter((s) => s.id !== id) : [entry, ...prev]);
  };
  const toggleFavoriteSong = (id: string) => setFavoriteSongs((prev) => prev.includes(id)
    ? prev.filter((s) => s !== id) : [...prev, id]);

  const value = useMemo<MusicState>(() => ({
    tab, goTo: setTab, appearance, setAppearance,
    current, song, station, playing, playbackError, playerOpen, setPlayerOpen,
    playSong, playStation, togglePlayback,
    next: () => cycle(1), previous: () => cycle(-1),
    queue, playNext, playLater, moveInQueue, clearUpNext,
    canUndoQueue: previousQueue !== null, undoQueue,
    favoriteSongs, favoriteStations, favoriteStationRecords, customStations, radioStations,
    addRadioResults, addCustomStation, removeCustomStation,
    toggleFavoriteSong, toggleFavoriteStation,
  }), [tab, appearance, current, song, station, playing, playbackError, playerOpen,
    queue, previousQueue, favoriteSongs, favoriteStations, favoriteStationRecords,
    customStations, radioStations, addRadioResults]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="none" playsInline
        onPlaying={() => { setPlaying(true); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing"; }}
        onPause={() => { setPlaying(false); if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused"; }}
        onWaiting={() => setPlaying(false)}
        onError={() => { setPlaying(false); setPlaybackError("The stream is offline, blocked, or its audio format isn't supported by this browser."); }}
      />
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicState {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used inside MusicProvider");
  return context;
}
