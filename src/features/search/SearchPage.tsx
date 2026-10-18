import { useDeferredValue, useMemo, useState } from "react";
import { Check, ListPlus, MoreHorizontal, Search, X } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { albums, songs } from "../../data/demo";
import { RADIO_FALLBACK_ART } from "../../services/radioBrowser";
import { useMusic } from "../../state/MusicProvider";

type Filter = "all" | "songs" | "albums" | "artists" | "radio";
const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "songs", label: "Songs" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "radio", label: "Radio" },
];

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [optionsSongId, setOptionsSongId] = useState<string | null>(null);
  const [queueNotice, setQueueNotice] = useState("");
  const { playSong, playStation, goTo, playNext, playLater, canUndoQueue, undoQueue, radioStations, favoriteStationRecords } = useMusic();
  const needle = useDeferredValue(query.trim().toLocaleLowerCase());
  const results = useMemo(() => {
    const sorted = <T extends { title?: string; name?: string }>(entries: T[]) => [...entries].sort((a, b) => {
      const titleA = (a.title ?? a.name ?? "").toLocaleLowerCase();
      const titleB = (b.title ?? b.name ?? "").toLocaleLowerCase();
      return Number(titleB.startsWith(needle)) - Number(titleA.startsWith(needle)) || titleA.localeCompare(titleB);
    });
    const contains = (...terms: string[]) => terms.some((term) => term.toLocaleLowerCase().includes(needle));
    return {
      songs: sorted(songs.filter((song) => contains(song.title, song.artist, song.album, song.genre, String(song.year)))),
      albums: sorted(albums.filter((album) => contains(album.title, album.artist, String(album.year)))),
      artists: [...new Set(songs.map((song) => song.artist))].filter((artist) => contains(artist)).sort(),
      radio: sorted([...new Map([...radioStations, ...favoriteStationRecords].map((s) => [s.id, s])).values()]
        .filter((station) => contains(station.name, station.genre, station.description))),
    };
  }, [needle, radioStations, favoriteStationRecords]);

  const include = (tab: Filter) => filter === "all" || filter === tab;
  const queueAction = (id: string, kind: "next" | "later") => {
    if (kind === "next") playNext(id);
    else playLater(id);
    setQueueNotice(kind === "next" ? "Added to Play Next" : "Added to Play Later");
    setOptionsSongId(null);
  };

  return (
    <div className="page">
      <header className="page-header"><h1>Search</h1></header>
      <div className="search-field">
        <Search size={20} aria-hidden="true"/>
        <input aria-label="Search your music library and radio" autoComplete="off" type="search"
          placeholder="Artists, albums, songs, radio..." value={query} onChange={(e) => { setQuery(e.target.value); setOptionsSongId(null); }}/>
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18}/></button>}
      </div>
      {!needle ? (
        <section className="page-section">
          <h2>Browse</h2>
          <div className="search-browse">
            {[{ label: "Artists", image: albums[2].cover, tab: "library" },
              { label: "Albums", image: albums[0].cover, tab: "library" },
              { label: "Radio Stations", image: RADIO_FALLBACK_ART, tab: "radio" },
              { label: "Get Music", image: albums[4].cover, tab: "get-music" }].map((item) =>
              <button type="button" key={item.label} className="browse-tile"
                onClick={() => goTo(item.tab as "library" | "radio" | "get-music")}>
                <CoverArt src={item.image} alt=""/><strong>{item.label}</strong>
              </button>)}
          </div>
          <p className="footnote">Search will include your family's entire Navidrome catalog when connected.</p>
        </section>
      ) : (
        <>
          <div className="pill-row scroll-pills search-filters" role="group" aria-label="Filter search results">
            {filters.map(({ id, label }) =>
              <button key={id} type="button" className={"pill" + (filter === id ? " active" : "")} onClick={() => setFilter(id)}
                aria-pressed={filter === id}>{label}</button>)}
          </div>
          {queueNotice && (
            <div className="queue-notice" role="status"><Check size={16}/><span>{queueNotice}</span>
              {canUndoQueue && <button type="button" onClick={() => { undoQueue(); setQueueNotice(""); }}>Undo</button>}
              <button type="button" aria-label="Dismiss" onClick={() => setQueueNotice("")}><X size={16}/></button>
            </div>
          )}
          {include("songs") && results.songs.length > 0 && <section className="page-section">
            <h2>Songs <span className="result-count">{results.songs.length}</span></h2>
            <div className="library-list">
              {results.songs.map((song) => (
                <div className="music-list-row search-track" key={song.id}>
                  <button type="button" className="music-list-row__main" onClick={() => playSong(song.id)}>
                    <CoverArt src={song.cover} alt=""/>
                    <span><strong>{song.title}</strong><small>{song.artist} · {song.album}</small></span>
                  </button>
                  <button type="button" className="icon-button" aria-expanded={optionsSongId === song.id}
                    aria-label={"Options for " + song.title}
                    onClick={() => setOptionsSongId(optionsSongId === song.id ? null : song.id)}>
                    <MoreHorizontal size={21}/>
                  </button>
                  {optionsSongId === song.id && (
                    <div className="search-track-actions">
                      <button type="button" onClick={() => queueAction(song.id, "next")}><ListPlus size={17}/> Play Next</button>
                      <button type="button" onClick={() => queueAction(song.id, "later")}><ListPlus size={17}/> Play Later</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>}
          {include("albums") && results.albums.length > 0 && <section className="page-section">
            <h2>Albums <span className="result-count">{results.albums.length}</span></h2>
            <div className="album-grid">
              {results.albums.map((album) => <button type="button" className="album-grid-card" key={album.id}
                onClick={() => { const first = songs.find((song) => song.albumId === album.id); if (first) playSong(first.id); }}>
                <CoverArt src={album.cover} alt=""/>
                <strong>{album.title}</strong><small>{album.artist} · {album.year}</small>
              </button>)}
            </div>
          </section>}
          {include("artists") && results.artists.length > 0 && <section className="page-section">
            <h2>Artists <span className="result-count">{results.artists.length}</span></h2>
            <div className="library-list">
              {results.artists.map((artist) => <button type="button" className="library-category-row" key={artist}
                onClick={() => { const first = songs.find((song) => song.artist === artist); if (first) playSong(first.id); }}>
                <span>{artist}</span>
                <small className="result-count">Artist</small>
              </button>)}
            </div>
          </section>}
          {include("radio") && results.radio.length > 0 && <section className="page-section">
            <h2>Radio <span className="result-count">{results.radio.length}</span></h2>
            <div className="library-list">{results.radio.map((station) =>
              <button type="button" className="music-list-row__main search-result" key={station.id} onClick={() => playStation(station)}>
                <CoverArt src={station.cover} alt=""/>
                <span><strong>{station.name}</strong><small>{station.description}</small></span>
              </button>)}</div>
          </section>}
          {include("radio") && needle && (
            <button type="button" className="radio-load-more" onClick={() => goTo("radio")}>
              Browse worldwide radio directory
            </button>
          )}
          {(!include("songs") || !results.songs.length) &&
           (!include("albums") || !results.albums.length) &&
           (!include("artists") || !results.artists.length) &&
           (!include("radio") || !results.radio.length) &&
           <p className="empty-state">No matching results for “{query}”. Try another title, artist, or station.</p>}
        </>
      )}
    </div>
  );
}
