import { ChevronRight, Heart, RadioTower } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { albums, songs } from "../../data/demo";
import { RADIO_FALLBACK_ART } from "../../services/radioBrowser";
import { useMusic } from "../../state/MusicProvider";

export function HomePage({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { goTo, playSong, playStation, favoriteSongs, favoriteStationRecords } = useMusic();
  const featured = songs[0];
  return (
    <div className="page">
      <header className="page-header"><h1>Home</h1>
        <button type="button" className="avatar-button" onClick={onOpenSettings} aria-label="Open profile and settings">FM</button>
      </header>
      <div className="pill-row" aria-label="Home shortcuts">
        <button className="pill active" type="button">Music</button>
        <button className="pill" type="button" onClick={() => goTo("radio")}>Radio</button>
        <button className="pill" type="button" onClick={() => goTo("library")}>Recently Played</button>
      </div>

      <section className="page-section">
        <h2>Continue Listening</h2>
        <div className="continue-grid">
          <button type="button" className="featured-card" onClick={() => playSong(featured.id)}>
            <CoverArt src={featured.cover} alt="" />
            <span><strong>{featured.title}</strong><small>{featured.artist}</small></span>
          </button>
          <button type="button" className="featured-card featured-card--radio" onClick={() => { if (favoriteStationRecords[0]) playStation(favoriteStationRecords[0]); else goTo("radio"); }}>
            <span className="featured-radio-art"><RadioTower size={40}/></span>
            <span><strong>{favoriteStationRecords[0]?.name ?? "Live Radio"}</strong><small>{favoriteStationRecords[0]?.genre ?? "Explore stations"}</small></span>
          </button>
        </div>
      </section>

      <section className="page-section">
        <div className="section-title"><h2>Made for You</h2><button type="button" onClick={() => goTo("library")}>See All <ChevronRight size={16}/></button></div>
        <div className="quick-grid">
          <button type="button" className="quick-tile quick-tile--favorite" onClick={() => goTo("library")}>
            <Heart size={28} fill="currentColor"/><strong>Favorites</strong><small>{favoriteSongs.length} saved songs</small>
          </button>
          <button type="button" className="quick-tile quick-tile--recent" onClick={() => goTo("library")}>
            <span className="tile-icon">♫</span><strong>Recently Added</strong><small>Browse your library</small>
          </button>
          <button type="button" className="quick-tile quick-tile--import" onClick={() => goTo("get-music")}>
            <span className="tile-icon">↓</span><strong>Add Music</strong><small>From your purchases</small>
          </button>
        </div>
      </section>

      <section className="page-section">
        <div className="section-title"><h2>Recently Added</h2><button type="button" onClick={() => goTo("library")}>See All <ChevronRight size={16}/></button></div>
        <div className="album-scroll">
          {albums.map((album) => (
            <button type="button" className="album-tile" key={album.id} onClick={() => {
              const track = songs.find((s) => s.albumId === album.id);
              if (track) playSong(track.id);
            }}>
              <CoverArt src={album.cover} alt={album.title + " sample artwork"}/>
              <strong>{album.title}</strong><small>{album.artist}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-title"><h2>Your Stations</h2><button type="button" onClick={() => goTo("radio")}>See All <ChevronRight size={16}/></button></div>
        <div className="station-shortcuts">
          {favoriteStationRecords.slice(0, 2).map((station) => (
            <button type="button" className="station-shortcut" key={station.id} onClick={() => { goTo("radio"); playStation(station); }}>
              <CoverArt src={station.cover} alt=""/>
              <span><strong>{station.name}</strong><small>{station.genre}</small></span>
            </button>
          ))}
        {!favoriteStationRecords.length && (
            <button type="button" className="station-shortcut" onClick={() => goTo("radio")}>
              <CoverArt src={RADIO_FALLBACK_ART} alt=""/>
              <span><strong>Discover Radio</strong><small>Browse stations of every genre</small></span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
