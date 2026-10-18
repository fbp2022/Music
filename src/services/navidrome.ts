import type { Album, Song, Station } from "../types/music";

/**
 * Backend integration boundary.
 * The browser frontend will call a secured Navidrome endpoint after deployment.
 * This file intentionally NEVER embeds long-lived admin credentials.
 */
export interface MusicBackend {
  listAlbums(): Promise<Album[]>;
  listSongs(): Promise<Song[]>;
  listStations(): Promise<Station[]>;
  streamUrl(songId: string): Promise<string>;
}

export class NavidromeNotConnectedError extends Error {
  constructor() {
    super("Navidrome is not connected. This is an interactive UI prototype.");
    this.name = "NavidromeNotConnectedError";
  }
}

export const navidrome: MusicBackend = {
  async listAlbums() { throw new NavidromeNotConnectedError(); },
  async listSongs() { throw new NavidromeNotConnectedError(); },
  async listStations() { throw new NavidromeNotConnectedError(); },
  async streamUrl(_songId: string) { throw new NavidromeNotConnectedError(); },
};
