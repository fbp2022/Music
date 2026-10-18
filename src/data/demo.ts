import type { Album, Song, Station, Store } from "../types/music";

// Entire catalog is fictional sample data for visual interaction only.
// These photographs are atmospheric placeholders, not artist/album cover claims.
const art = {
  mountain: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=700&q=85",
  sunrise: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=85",
  forest: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=85",
  ocean: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=700&q=85",
  stage: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&q=85",
  hills: "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=85",
};

export const albums: Album[] = [
  { id: "a1", title: "Higher Ground", artist: "North Valley", year: 2024, cover: art.sunrise },
  { id: "a2", title: "Still Waters", artist: "The Harbor", year: 2022, cover: art.ocean },
  { id: "a3", title: "Morning Light", artist: "Anna Grace", year: 2025, cover: art.forest },
  { id: "a4", title: "Open Skies", artist: "Stone & River", year: 2023, cover: art.mountain },
  { id: "a5", title: "The Journey", artist: "Evergreen", year: 2021, cover: art.hills },
  { id: "a6", title: "Live Together", artist: "Gathered Voices", year: 2024, cover: art.stage },
];

export const songs: Song[] = [
  { id: "s1", title: "Higher Ground", artist: "North Valley", album: "Higher Ground", albumId: "a1", genre: "Worship", year: 2024, duration: 223, cover: art.sunrise, source: "CD" },
  { id: "s2", title: "The Way Home", artist: "North Valley", album: "Higher Ground", albumId: "a1", genre: "Worship", year: 2024, duration: 241, cover: art.sunrise, source: "iTunes" },
  { id: "s3", title: "Still Waters", artist: "The Harbor", album: "Still Waters", albumId: "a2", genre: "Christian", year: 2022, duration: 202, cover: art.ocean, source: "Qobuz" },
  { id: "s4", title: "Morning Light", artist: "Anna Grace", album: "Morning Light", albumId: "a3", genre: "Christian", year: 2025, duration: 194, cover: art.forest, source: "Bandcamp" },
  { id: "s5", title: "New Horizon", artist: "Stone & River", album: "Open Skies", albumId: "a4", genre: "Pop", year: 2023, duration: 216, cover: art.mountain, source: "HDtracks" },
  { id: "s6", title: "All the Way", artist: "Evergreen", album: "The Journey", albumId: "a5", genre: "Classic Rock", year: 2021, duration: 232, cover: art.hills, source: "CD" },
  { id: "s7", title: "One Voice", artist: "Gathered Voices", album: "Live Together", albumId: "a6", genre: "Gospel", year: 2024, duration: 278, cover: art.stage, source: "CD" },
];

export const stations: Station[] = [];

export const stores: Store[] = [
  { id: "qobuz", name: "Qobuz", category: "Mainstream & lossless", details: "Albums, singles, FLAC and high-resolution downloads", link: "https://www.qobuz.com/us-en/shop" },
  { id: "bandcamp", name: "Bandcamp", category: "Independent artists", details: "Direct artist purchases and multiple audio formats", link: "https://bandcamp.com/" },
  { id: "hdtracks", name: "HDtracks", category: "High-resolution music", details: "Audiophile recordings, remasters and FLAC downloads", link: "https://www.hdtracks.com/" },
];
