import { ArrowDown, ArrowUp, Heart, ListMusic, Pause, Play, RotateCcw, SkipBack, SkipForward, Trash2, X } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { songs } from "../../data/demo";
import { useMusic } from "../../state/MusicProvider";
import { timeLabel } from "../../utils/time";

export function PlayerOverlay() {
  const { playerOpen, setPlayerOpen, song, station, playing, togglePlayback, next, previous,
    queue, favoriteSongs, favoriteStations, toggleFavoriteSong, toggleFavoriteStation, playbackError, moveInQueue, clearUpNext, canUndoQueue,
    undoQueue, playSong } = useMusic();
  if (!playerOpen) return null;

  const item = song ?? station;
  const currentIndex = song ? queue.indexOf(song.id) : -1;
  const upcoming = song ? queue.slice(currentIndex + 1) : [];

  return (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-labelledby="player-title">
      <div className="player-overlay__inner">
        <header className="player-overlay__header">
          <button type="button" className="icon-button" onClick={() => setPlayerOpen(false)} aria-label="Close player">
            <X size={25}/>
          </button>
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
          {station && <button type="button" className={"icon-button heart-button" + (favoriteStations.includes(station.id) ? " selected" : "")}
            onClick={() => toggleFavoriteStation(station.id)} aria-label="Favorite radio station">
            <Heart size={25} fill={favoriteStations.includes(station.id) ? "currentColor" : "none"}/>
          </button>}
        </div>
        <div className="progress-placeholder"><span /></div>
        <div className="progress-label"><span>0:00</span><span>{song ? timeLabel(song.duration) : "LIVE"}</span></div>
        <div className="player-actions">
          <button type="button" onClick={previous} disabled={!song} aria-label="Previous track"><SkipBack size={32} fill="currentColor"/></button>
          <button type="button" className="player-actions__main" onClick={togglePlayback} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause size={30} fill="currentColor"/> : <Play size={30} fill="currentColor"/>}
          </button>
          <button type="button" onClick={next} disabled={!song} aria-label="Next track"><SkipForward size={32} fill="currentColor"/></button>
        </div>
        {station ? (
          <div className="prototype-message" role={playbackError ? "alert" : "status"}>
            {playbackError || (playing ? "Streaming live radio" : "Station selected — tap Play to listen")}
          </div>
        ) : <div className="prototype-message">Sample music only — Navidrome has not been connected yet.</div>}
        {song && (
          <section className="up-next">
            <div className="up-next-header">
              <h3><ListMusic size={18}/> Up Next <small>{upcoming.length}</small></h3>
              <div className="queue-tools">
                {canUndoQueue && <button type="button" onClick={undoQueue} aria-label="Undo last queue change"><RotateCcw size={17}/> Undo</button>}
                <button type="button" disabled={upcoming.length === 0} onClick={clearUpNext} aria-label="Clear upcoming songs">
                  <Trash2 size={17}/> Clear
                </button>
              </div>
            </div>
            {upcoming.length === 0 && <p className="empty-state">Nothing else queued. Search for a song and choose Play Next or Play Later.</p>}
            {upcoming.map((id, idx) => {
              const entry = songs.find((s) => s.id === id);
              if (!entry) return null;
              return (
                <div className="queue-row" key={id}>
                  <button type="button" className="queue-row__title" onClick={() => playSong(id)}>
                    <CoverArt src={entry.cover} alt=""/>
                    <span><strong>{entry.title}</strong><small>{entry.artist}</small></span>
                  </button>
                  <div className="queue-reorder">
                    <button type="button" className="icon-button" onClick={() => moveInQueue(id, -1)} disabled={idx === 0} aria-label={"Move " + entry.title + " earlier"}>
                      <ArrowUp size={18}/>
                    </button>
                    <button type="button" className="icon-button" onClick={() => moveInQueue(id, 1)} disabled={idx === upcoming.length - 1} aria-label={"Move " + entry.title + " later"}>
                      <ArrowDown size={18}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
