import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { albums, songs, stations } from "../../data/demo";
import { useMusic } from "../../state/MusicProvider";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const { playSong, playStation, goTo } = useMusic();
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => ({
    songs: songs.filter((song) => [song.title, song.artist, song.album, song.genre].some((text) => text.toLowerCase().includes(needle))),
    stations: stations.filter((station) => [station.name, station.genre, station.description].some((text) => text.toLowerCase().includes(needle))),
  }), [needle]);
  return (
    <div className="page">
      <header className="page-header"><h1>Search</h1></header>
      <label className="search-field"><Search size={20}/><input autoComplete="off" type="search" placeholder="Artists, albums, songs, radio..." value={query} onChange={(e) => setQuery(e.target.value)}/>
        {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={18}/></button>}</label>
      {!needle ? (
        <section className="page-section">
          <h2>Browse</h2>
          <div className="search-browse">
            {[{ label: "Artists", image: albums[2].cover, tab: "library" }, { label: "Albums", image: albums[0].cover, tab: "library" },
              { label: "Radio Stations", image: stations[0].cover, tab: "radio" }, { label: "Get Music", image: albums[4].cover, tab: "get-music" }].map((item) =>
              <button type="button" key={item.label} className="browse-tile" onClick={() => goTo(item.tab as "library" | "radio" | "get-music")}>
                <CoverArt src={item.image} alt=""/><strong>{item.label}</strong></button>)}
          </div>
        </section>
      ) : (
        <>
          <section className="page-section">
            <h2>Songs ({matches.songs.length})</h2>
            <div className="library-list">{matches.songs.map((song) => <button type="button" className="music-list-row__main search-result" key={song.id}
              onClick={() => playSong(song.id)}><CoverArt src={song.cover} alt=""/><span><strong>{song.title}</strong><small>{song.artist} · {song.album}</small></span></button>)}</div>
          </section>
          <section className="page-section">
            <h2>Radio ({matches.stations.length})</h2>
            <div className="library-list">{matches.stations.map((station) => <button type="button" className="music-list-row__main search-result" key={station.id}
              onClick={() => playStation(station.id)}><CoverArt src={station.cover} alt=""/><span><strong>{station.name}</strong><small>{station.description}</small></span></button>)}</div>
          </section>
          {!matches.songs.length && !matches.stations.length && <p className="empty-state">Nothing matches “{query}”.</p>}
        </>
      )}
    </div>
  );
}
