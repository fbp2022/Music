import { Heart, Play, RadioTower, Search } from "lucide-react";
import { useState } from "react";
import { CoverArt } from "../../components/CoverArt";
import { stations } from "../../data/demo";
import { useMusic } from "../../state/MusicProvider";
import type { Station } from "../../types/music";

const categories: ("All" | Station["genre"])[] = ["All", "Christian", "Worship", "Gospel", "Talk"];
export function RadioPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Christian");
  const { playStation, favoriteStations, toggleFavoriteStation, goTo } = useMusic();
  const visible = stations.filter((s) => category === "All" || s.genre === category);
  return (
    <div className="page">
      <header className="page-header"><h1>Radio</h1><button type="button" className="icon-button" aria-label="Search" onClick={() => goTo("search")}><Search size={23}/></button></header>
      <div className="pill-row scroll-pills">{categories.map((entry) => <button className={"pill" + (category === entry ? " active" : "")} type="button"
        key={entry} onClick={() => setCategory(entry)}>{entry}</button>)}</div>
      <section className="page-section">
        <h2>{category === "All" ? "Featured Radio" : category + " Radio"}</h2>
        <button type="button" className="radio-hero" onClick={() => playStation(visible[0]?.id ?? stations[0].id)}>
          <CoverArt src={(visible[0] ?? stations[0]).cover} alt=""/>
          <span className="radio-hero__overlay">
            <span className="live-label"><RadioTower size={13}/> LIVE RADIO</span>
            <strong>{(visible[0] ?? stations[0]).name}</strong>
            <small>{(visible[0] ?? stations[0]).description}</small>
            <span className="round-play"><Play size={19} fill="currentColor"/></span>
          </span>
        </button>
      </section>
      <section className="page-section">
        <h2>Stations</h2>
        <div className="library-list">{visible.map((station) => (
          <div className="music-list-row" key={station.id}>
            <button type="button" className="music-list-row__main" onClick={() => playStation(station.id)}>
              <CoverArt src={station.cover} alt=""/>
              <span><strong>{station.name}</strong><small>{station.description}</small></span>
            </button>
            <button type="button" className={"icon-button" + (favoriteStations.includes(station.id) ? " selected" : "")}
              onClick={() => toggleFavoriteStation(station.id)} aria-label={"Favorite station " + station.name}>
              <Heart size={20} fill={favoriteStations.includes(station.id) ? "currentColor" : "none"}/>
            </button>
          </div>
        ))}</div>
      </section>
      <section className="page-section">
        <h2>Favorite Stations</h2>
        <div className="station-shortcuts">{stations.filter((s) => favoriteStations.includes(s.id)).map((station) =>
          <button type="button" className="station-shortcut" key={station.id} onClick={() => playStation(station.id)}>
            <CoverArt src={station.cover} alt=""/><span><strong>{station.name}</strong><small>{station.genre}</small></span>
          </button>)}</div>
      </section>
      <p className="footnote">Station directory is illustrative. Live stream URLs and radio metadata will be connected later.</p>
    </div>
  );
}
