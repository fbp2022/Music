# Family Music

An iPhone-first family music web app, being developed as an installable PWA. The design follows familiar Apple Music navigation while keeping personal profiles, radio, music purchases, and library organization distinct.

## Project status

**Phase 1: interactive frontend prototype.** It uses clearly marked demo content and local browser settings. Playback controls demonstrate the intended UI, but **there is no active audio stream, login, upload endpoint, or live Navidrome connection yet**. Nothing in the demo purchases music or sends a file to a server.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Open the URL Vite shows (normally http://localhost:5173). For a production build run `npm run build`.

## Project structure

```
src/
  app/            App shell and app entry
  components/     Shared UI (artwork, navigation, mini player)
  data/           Explicitly fictional sample catalog and radio stations
  features/
    home/         Home page
    library/      Albums, artists, tracks and playlists
    radio/        Radio browsing and favorites
    stores/       Qobuz, Bandcamp, HDtracks links + file selection
    search/       Unified catalog/station search
    settings/     Light / Dark / Same as System
    player/       Now Playing / queue UI
  services/       Navidrome integration boundary (not yet connected)
  state/          Shared UI state and demo preferences
  styles/         Design tokens, layout, components and responsive CSS
  types/          Shared TypeScript contracts
```

## Requirements retained

- Shared Navidrome music catalog with independent, dynamic family users and listening data.
- Personal favorites, history, radio favorites and settings; never share music-store accounts.
- Three external purchase links: Qobuz, Bandcamp, HDtracks. Each family member buys using their own credentials at the store, downloads the audio, then imports it through our app.
- Navidrome remains the music backend; a separate on-server import service will be necessary for uploads and account administration. The frontend stays frontend-only.
- iPhone PWA and responsive desktop/tablet UI. Default appearance: Same as System.
- No Cloudflare R2 or paid media storage added by this frontend.

## Integration plan

1. Deploy Navidrome on the selected infrastructure and secure an HTTPS same-origin route for its API.
2. Implement Subsonic/OpenSubsonic integration in `src/services/navidrome.ts`. Do not embed administrator credentials or long-lived secrets in a public frontend bundle.
3. Replace sample data with per-user authenticated library data and persist account-specific preferences server-side.
4. Add a separately secured upload/import service on the same infrastructure to validate audio and archives, check duplicates, preserve provenance, and update the Navidrome music directory.
5. Implement real HTMLAudioElement playback, Media Session API, queue persistence and network recovery. Test iOS lock-screen audio, backgrounding, memory pressure and AirPlay on real devices.
6. Implement actual PWA service worker and an iOS-specific offline test plan. The demo is responsive but does not claim verified offline audio support.

No licensed recordings, passwords, tokens, or account data belong in this repository.
