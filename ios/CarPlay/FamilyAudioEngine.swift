import AVFoundation
import Foundation
import MediaPlayer

/// Starter native audio engine for a future signed iOS companion.
/// Not linked to the React app or an Xcode project yet.
@MainActor
final class FamilyAudioEngine {
    static let shared = FamilyAudioEngine()

    private let player = AVPlayer()
    private var currentTitle: String?
    private var currentSubtitle: String?
    private var liveStream = false

    private init() {
        configureRemoteCommands()
    }

    func playAudio(url: URL, title: String, subtitle: String, live: Bool) throws {
        guard url.scheme?.lowercased() == "https" else {
            throw AudioError.insecureStream
        }

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [])
        try session.setActive(true)

        currentTitle = title
        currentSubtitle = subtitle
        liveStream = live

        player.replaceCurrentItem(with: AVPlayerItem(url: url))
        player.play()
        refreshNowPlaying(playing: true)
    }

    func pause() {
        player.pause()
        refreshNowPlaying(playing: false)
    }

    func resume() {
        player.play()
        refreshNowPlaying(playing: true)
    }

    func stop() {
        player.pause()
        player.replaceCurrentItem(with: nil)
        currentTitle = nil
        currentSubtitle = nil
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    private func refreshNowPlaying(playing: Bool) {
        guard let currentTitle else { return }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: currentTitle,
            MPMediaItemPropertyArtist: currentSubtitle ?? "",
            MPNowPlayingInfoPropertyIsLiveStream: liveStream,
            MPNowPlayingInfoPropertyPlaybackRate: playing ? 1.0 : 0.0
        ]
    }

    private func configureRemoteCommands() {
        let remote = MPRemoteCommandCenter.shared()
        remote.playCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.resume() }
            return .success
        }
        remote.pauseCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.pause() }
            return .success
        }
        remote.stopCommand.addTarget { [weak self] _ in
            Task { @MainActor in self?.stop() }
            return .success
        }
        // Next/previous require a real Navidrome-backed play queue.
        remote.nextTrackCommand.isEnabled = false
        remote.previousTrackCommand.isEnabled = false
    }

    enum AudioError: Error {
        case insecureStream
    }
}
