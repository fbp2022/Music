import { Heart, ListMusic, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { songs } from "../../data/demo";
import { useMusic } from "../../state/MusicProvider";
import { timeLabel } from "../../utils/time";

export function PlayerOverlay() {
  const { playerOpen, setPlayerOpen, song, station, playing, togglePlayback, next, previous,
    queue, favoriteSongs, toggleFavoriteSong, removeFromQueue, playSong } = useMusic();
  if (!playerOpen) return null;
  const item = song ?? station;
  return (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-labelledby="player-title">
      <div className="player-overlay__inner">
        <header className="player-overlay__header">
          <button type="button" className="icon-button" onClick={() => setPlayerOpen(false)} aria-label="Close player"><X size={25}/></button>
          <span className="overline">NOW PLAYING</span>
          <span className="header-spacer" />
        </header>
        {item && <CoverArt src={item.cover} alt="" className="player-art" />}
        <div className="player-title-row">
          <div className="player-title-copy">
            <h2 id="player-title">{song?.title ?? station?.name ?? "Nothing selected"}</h2>
            <p>{song?.artist ?? station?.description}</p>
          </div>
          {song && <button type="button" className={"icon-button heart-button" + (favoriteSongs.includes(song.id) ? " selected" : "")}
            onClick={() => toggleFavoriteSong(song.id)} aria-label="Toggle favorite">
            <Heart size={25} fill={favoriteSongs.includes(song.id) ? "currentColor" : "none"}/>
          </button>}
        </div>
        <div className="progress-placeholder"><span /></div>
        <div className="progress-label"><span>0:00</span><span>{song ? timeLabel(song.duration) : "LIVE"}</span></div>
        <div className="player-actions">
          <button type="button" onClick={previous} disabled={!song} aria-label="Previous track"><SkipBack size={32} fill="currentColor"/></button>
          <button type="button" className="player-actions__main" onClick={togglePlayback} aria-label={playing ? "Pause UI preview" : "Play UI preview"}>
            {playing ? <Pause size={30} fill="currentColor"/> : <Play size={30} fill="currentColor"/>}
          </button>
          <button type="button" onClick={next} disabled={!song} aria-label="Next track"><SkipForward size={32} fill="currentColor"/></button>
        </div>
        <div className="prototype-message">UI preview only — audio playback will work after Navidrome is connected.</div>
        {song && (
          <section className="up-next">
            <h3><ListMusic size={18}/> Up Next</h3>
            {queue.filter((id) => id !== song.id).slice(0, 6).map((id, idx) => {
              const entry = songs.find((s) => s.id === id);
              if (!entry) return null;
              return (
                <div className="queue-row" key={id + "-" + idx}>
                  <button type="button" className="queue-row__title" onClick={() => playSong(id)}>
                    <CoverArt src={entry.cover} alt=""/>
                    <span><strong>{entry.title}</strong><small>{entry.artist}</small></span>
                  </button>
                  <button type="button" className="icon-button" onClick={() => removeFromQueue(id)} aria-label={"Remove " + entry.title + " from queue"}><X size={17}/></button>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
