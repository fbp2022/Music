# CarPlay implementation plan

**Status:** Architecture/design only. This is NOT a functioning CarPlay app yet. The React/Vite PWA cannot display its own custom app icon and browsing UI on the CarPlay dashboard by being installed to the iPhone Home Screen.

## Product architecture

- **One family music catalog** served by Navidrome and the chosen infrastructure. Each family member has their own sign-in, settings, favorites, history and statistics.
- **iPhone Web/PWA UI:** Keep the existing React application and Apple Music–familiar interface. It remains the canonical web experience.
- **iOS native companion:** A thin, separately built Swift/SwiftUI container will use the existing web UI for normal phone browsing *and native audio plumbing* (AVPlayer/AVAudioSession) to provide background playback, Now Playing metadata and hardware/head-unit remote commands.
- **CarPlay scene:** An Apple CarPlay audio-enabled scene uses CPTemplateApplicationSceneDelegate plus system templates (CPTabBarTemplate, CPListTemplate, CPNowPlayingTemplate) to browse music and radio and control the SAME playback queue. Do not render the web UI inside a CarPlay template or attempt to drive the dashboard screen with a web view.
- **Shared service contract:** Expose a secure authenticated catalog API for library/album/playlist/radio/favorite queries, and short-lived/authorized streaming URLs. Native code must not embed administrator tokens or credentials in the app bundle. Store credentials securely, not in localStorage.
- **Playback ownership:** A single native playback coordinator will handle audio, interruptions, route changes, media session metadata and remote commands. Web view sends commands to that coordinator through an explicit, validated native bridge. Prevent a web Audio element and native AVPlayer from playing simultaneously.
- **Voice and driving safety:** Prefer minimal browsing screens such as Radio Favorites, Library, Playlists, Recently Played, Now Playing. Apple controls the driving-safe templates and behavior.

## CarPlay UI tree

CarPlay
  - Listen Now
    - Continue Listening
    - Recently Played
  - Library
    - Playlists
    - Artists
    - Albums
  - Radio
    - Favorite Stations
    - By Genre
    - Recently Played Stations
  - Now Playing (system-managed)

Radio remains **all genres**; Christian, gospel and worship are ordinary genres/users' favorites, not the product's default theme.

## Dependencies that cannot be skipped

1. An Apple Developer Program account for standard signed distribution; currently USD $99/year (region/eligibility may differ).
2. Request and obtain Apple's **CarPlay Audio App entitlement**, `com.apple.developer.carplay-audio`. Approval is not automatic, particularly important to verify for a family/private-use service.
3. macOS and Xcode to create/build/sign/test the iOS target and the CarPlay scene. GitHub can hold all source code, but GitHub Pages cannot build or sign an iOS app.
4. Proper iOS background audio capability and use of AVAudioSession, AVPlayer, MPNowPlayingInfoCenter and MPRemoteCommandCenter.
5. Decide how family members install signed iOS builds (App Store/TestFlight where allowed, or other applicable official distribution pathway); TestFlight builds are not a permanent end-user distribution channel.
6. Simulator test (Xcode > I/O > External Displays > CarPlay), then real iPhones with an actual CarPlay vehicle.
7. Navidrome/family-user backend and secure audio endpoints before end-to-end music playback can work.

**No Apple Music subscription is required for playing original DRM-free audio through the native client.** Apple entitlement/program requirements concern software distribution and CarPlay access, not music catalog storage.

## Milestones

1. **Current:** Stabilize the existing GitHub Pages deploy, fix TypeScript build errors, recover the web interface and verify internet radio playback on iPhone.
2. Define web ↔ native commands and media models; prepare the iOS Xcode project on macOS. Do not reimplement the entire React UI.
3. Introduce a single native audio engine and test native background/lock-screen playback.
4. Apply for CarPlay audio entitlement. Approval is external and cannot be guaranteed.
5. Build CarPlay template navigation and playback once entitlement is available; test against real vehicle controls and interruptions.
6. Distribute the native iPhone companion through an approved Apple channel while continuing to maintain the PWA for browsers.

## Primary Apple documentation

- https://developer.apple.com/documentation/carplay/requesting-carplay-entitlements
- https://developer.apple.com/documentation/carplay/integrating-carplay-with-your-music-app
- https://developer.apple.com/documentation/carplay/cpnowplayingtemplate
- https://developer.apple.com/programs/
