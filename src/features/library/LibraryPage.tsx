import { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Disc3, Download, Heart, ListMusic, MicVocal, Music2, Tag } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { albums, songs } from "../../data/demo";
import { useMusic } from "../../state/MusicProvider";
import { timeLabel } from "../../utils/time";

type Category = "Playlists" | "Artists" | "Albums" | "Songs" | "Genres" | "Downloaded" | "Recently Added" | "Favorites";
const categories = [
  { title: "Playlists" as Category, Icon: ListMusic },
  { title: "Artists" as Category, Icon: MicVocal },
  { title: "Albums" as Category, Icon: Disc3 },
  { title: "Songs" as Category, Icon: Music2 },
  { title: "Genres" as Category, Icon: Tag },
  { title: "Downloaded" as Category, Icon: Download },
  { title: "Recently Added" as Category, Icon: Disc3 },
  { title: "Favorites" as Category, Icon: Heart },
];
export function LibraryPage({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [category, setCategory] = useState<Category | null>(null);
  const [sort, setSort] = useState("title");
  const { playSong, favoriteSongs, toggleFavoriteSong } = useMusic();
  const orderedSongs = useMemo(() => {
    const filtered = category === "Favorites" ? songs.filter((song) => favoriteSongs.includes(song.id)) : songs;
    return [...filtered].sort((a, b) => sort === "artist" ? a.artist.localeCompare(b.artist) : sort === "year" ? b.year - a.year : a.title.localeCompare(b.title));
  }, [category, favoriteSongs, sort]);

  if (category) {
    const showSongs = category === "Songs" || category === "Favorites" || category === "Recently Added";
    return (
      <div className="page">
        <header className="page-header">
          <div className="header-title-stack">
            <button className="back-link" type="button" onClick={() => setCategory(null)}><ArrowLeft size={17}/> Library</button>
            <h1>{category}</h1>
          </div>
          {showSongs && <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort music">
            <option value="title">Title</option><option value="artist">Artist</option><option value="year">Newest</option>
          </select>}
        </header>
        {showSongs ? (
          <div className="library-list">
            {orderedSongs.map((song) => (
              <div className="music-list-row" key={song.id}>
                <button type="button" className="music-list-row__main" onClick={() => playSong(song.id)}>
                  <CoverArt src={song.cover} alt=""/>
                  <span><strong>{song.title}</strong><small>{song.artist} · {timeLabel(song.duration)}</small></span>
                </button>
                <button className={"icon-button" + (favoriteSongs.includes(song.id) ? " selected" : "")} type="button"
                  onClick={() => toggleFavoriteSong(song.id)} aria-label={"Favorite " + song.title}><Heart size={19} fill={favoriteSongs.includes(song.id) ? "currentColor" : "none"}/></button>
              </div>
            ))}
            {!orderedSongs.length && <p className="empty-state">No songs here yet.</p>}
          </div>
        ) : category === "Albums" || category === "Downloaded" ? (
          <div className="album-grid">{albums.map((album) => <button type="button" className="album-grid-card" key={album.id} onClick={() => {
            const track = songs.find((song) => song.albumId === album.id); if (track) playSong(track.id);
          }}><CoverArt src={album.cover} alt=""/><strong>{album.title}</strong><small>{album.artist}</small></button>)}</div>
        ) : category === "Artists" || category === "Genres" ? (
          <div className="library-list">
            {[...new Set(songs.map((song) => category === "Artists" ? song.artist : song.genre))].sort().map((name) => (
              <button type="button" className="library-category-row" key={name} onClick={() => {
                const found = songs.find((song) => category === "Artists" ? song.artist === name : song.genre === name);
                if (found) playSong(found.id);
              }}><span>{name}</span><ChevronRight size={17}/></button>
            ))}
          </div>
        ) : (
          <div className="library-list">{["Sunday Morning", "On the Road", "Family Favorites"].map((title, index) => (
            <button type="button" className="music-list-row__main playlist-row" key={title} onClick={() => playSong(songs[index].id)}>
              <CoverArt src={albums[index].cover} alt=""/><span><strong>{title}</strong><small>Sample playlist</small></span>
            </button>
          ))}</div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Library</h1>
        <button type="button" className="text-action" onClick={onOpenSettings}>Edit</button>
      </header>
      <div className="library-list category-list">
        {categories.map(({ title, Icon }) => (
          <button type="button" className="library-category-row" key={title} onClick={() => setCategory(title)}>
            <Icon size={21} className="accent-icon"/><span>{title}</span><ChevronRight size={18} className="chevron"/>
          </button>
        ))}
      </div>
      <section className="page-section">
        <div className="section-title"><h2>Recently Added</h2><button type="button" onClick={() => setCategory("Albums")}>See All <ChevronRight size={16}/></button></div>
        <div className="album-grid">
          {albums.slice(0, 4).map((album) => <button type="button" className="album-grid-card" key={album.id} onClick={() => {
            const track = songs.find((song) => song.albumId === album.id); if (track) playSong(track.id);
          }}><CoverArt src={album.cover} alt=""/><strong>{album.title}</strong><small>{album.artist}</small></button>)}
        </div>
      </section>
      <p className="footnote">Demo library — replace with your Navidrome catalog when connected.</p>
    </div>
  );
}
