import type { Station } from "../types/music";

/** Radio Browser is a free, community-curated directory, independent of Navidrome. */
const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];
export const RADIO_FALLBACK_ART = "/Music/radio.svg";

interface RadioBrowserStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  url: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  language: string;
  codec: string;
  bitrate: number;
  lastcheckok: number | boolean;
}

export interface RadioFilters {
  name?: string;
  tag?: string;
  countrycode?: string;
  language?: string;
  order?: "votes" | "name" | "bitrate";
  offset?: number;
  limit?: number;
}

function secureUrl(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export function isSecureAudioUrl(url: string): boolean {
  return Boolean(secureUrl(url));
}

function asStation(raw: RadioBrowserStation): Station | null {
  // Browsers cannot play HTTP streams from an HTTPS site (mixed content).
  const streamUrl = secureUrl(raw.url_resolved || raw.url);
  if (!streamUrl || !raw.stationuuid || !raw.name?.trim()) return null;
  if (raw.lastcheckok === 0 || raw.lastcheckok === false) return null;
  const tags = (raw.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  return {
    id: raw.stationuuid,
    name: raw.name.trim(),
    genre: tags[0] || "Radio",
    description: [raw.country, raw.codec, raw.bitrate > 0 ? raw.bitrate + " kbps" : ""].filter(Boolean).join(" · "),
    cover: secureUrl(raw.favicon) || RADIO_FALLBACK_ART,
    website: secureUrl(raw.homepage),
    streamUrl,
    country: raw.country,
    language: raw.language,
    codec: raw.codec,
    bitrate: raw.bitrate,
    tags,
    source: "radio-browser",
  };
}

export async function findRadioStations(filters: RadioFilters, signal?: AbortSignal): Promise<Station[]> {
  const params = new URLSearchParams({
    hidebroken: "true",
    is_https: "true",
    order: filters.order ?? "votes",
    reverse: filters.order === "name" ? "false" : "true",
    limit: String(Math.min(70, Math.max(1, filters.limit ?? 35))),
    offset: String(Math.max(0, filters.offset ?? 0)),
  });
  if (filters.name?.trim()) params.set("name", filters.name.trim());
  if (filters.tag?.trim()) params.set("tag", filters.tag.trim().toLowerCase());
  if (filters.countrycode?.trim()) params.set("countrycode", filters.countrycode.trim().toUpperCase());
  if (filters.language?.trim()) params.set("language", filters.language.trim().toLowerCase());

  let lastError: unknown;
  for (const mirror of MIRRORS) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const response = await fetch(mirror + "/json/stations/search?" + params, {
        signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Radio directory returned " + response.status);
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error("Unexpected radio-directory response");
      const stations = (data as RadioBrowserStation[]).map(asStation).filter((s): s is Station => s !== null);
      return [...new Map(stations.map((s) => [s.id, s])).values()];
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }
  throw new Error("Unable to reach the public radio directory. Try again in a moment.", { cause: lastError });
}

export function reportStationListen(id: string) {
  // Radio Browser asks apps to count station clicks. Never block playback on this.
  if (!/^[0-9a-f-]{20,}$/i.test(id)) return;
  void fetch(MIRRORS[0] + "/json/url/" + encodeURIComponent(id), { mode: "cors" }).catch(() => undefined);
}

export function stationFromManualEntry(name: string, streamUrl: string, genre: string): Station {
  const safeUrl = secureUrl(streamUrl);
  if (!safeUrl) throw new Error("Use an HTTPS audio stream URL to avoid blocked playback on iPhone.");
  const title = name.trim();
  if (!title) throw new Error("Enter a station name.");
  return {
    id: "custom:" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 8),
    name: title,
    genre: genre.trim() || "Other",
    description: "Custom station",
    cover: RADIO_FALLBACK_ART,
    website: "",
    streamUrl: safeUrl,
    source: "custom",
  };
}

export function readLocalStations(): Station[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("fm-custom-radio") || "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Station => typeof item?.id === "string" &&
      typeof item?.name === "string" && typeof item?.streamUrl === "string" &&
      isSecureAudioUrl(item.streamUrl)).slice(0, 100);
  } catch {
    return [];
  }
}
