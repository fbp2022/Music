# Native iPhone / CarPlay companion scaffold

This directory contains **uncompiled Swift starter code**, not an Xcode project,
not an installable iPhone app, and not an approved CarPlay implementation.

- `CarPlay/FamilyAudioEngine.swift`: AVPlayer-based HTTPS audio entry point and basic lock-screen/remote play-pause-stop integration. Future tasks: error handling, reconnects, queue control, artwork, and secure authenticated Navidrome playback.
- `CarPlay/FamilyCarPlaySceneDelegate.swift`: entry point for a CarPlay audio scene using Apple's approved native templates. The displayed items are intentionally marked unavailable until actual authenticated library/radio data exists.

To turn this into a functioning product, create an Xcode iOS app, configure audio
background mode and a proper CarPlay scene in Info.plist, request and obtain
Apple's CarPlay Audio entitlement, provide authorized family catalog/stream
endpoints, integrate Swift ↔ React playback control, test in the CarPlay simulator
and real vehicles, and arrange legitimate app signing/distribution.

Read [CarPlay design and requirements](../docs/carplay.md).
