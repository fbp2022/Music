import { Pause, Play, SkipForward } from "lucide-react";
import { CoverArt } from "./CoverArt";
import { useMusic } from "../state/MusicProvider";

export function MiniPlayer() {
  const { song, station, playing, playbackError, togglePlayback, next, setPlayerOpen } = useMusic();
  const item = song ?? station;
  if (!item) return null;
  return (
    <div className="mini-player" role="group" aria-label="Current selection">
      <button type="button" className="mini-player__details" onClick={() => setPlayerOpen(true)} aria-label="Open Now Playing">
        <CoverArt src={item.cover} alt="" className="mini-player__art" />
        <span className="mini-player__text">
          <strong>{song?.title ?? station?.name}</strong>
          <small>{station ? (playbackError ? "Stream unavailable" : playing ? "LIVE · " + station.genre : "Radio · " + station.genre) : song?.artist}</small>
        </span>
      </button>
      <span className="mini-player__controls">
        <button type="button" className="icon-button" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause fill="currentColor" size={22}/> : <Play fill="currentColor" size={22}/>}
        </button>
        <button type="button" className="icon-button" disabled={!song} onClick={next} aria-label="Next song"><SkipForward fill="currentColor" size={22}/></button>
      </span>
    </div>
  );
}
