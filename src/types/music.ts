export type Tab = "home" | "library" | "radio" | "get-music" | "search";
export type Appearance = "light" | "dark" | "system";

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  genre: string;
  year: number;
  duration: number;
  cover: string;
  source: "CD" | "iTunes" | "Qobuz" | "Bandcamp" | "HDtracks";
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
}

export interface Station {
  id: string;
  name: string;
  genre: string;
  description: string;
  cover: string;
  website: string;
  streamUrl: string;
  country?: string;
  language?: string;
  codec?: string;
  bitrate?: number;
  tags?: string[];
  source?: "radio-browser" | "custom";
}

export interface Store {
  id: "qobuz" | "bandcamp" | "hdtracks";
  name: string;
  category: string;
  details: string;
  link: string;
}
