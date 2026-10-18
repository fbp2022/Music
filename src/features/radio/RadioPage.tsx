import { useEffect, useState, type FormEvent } from "react";
import { Globe2, Heart, LoaderCircle, Plus, RadioTower, RefreshCw, Search, Trash2, X } from "lucide-react";
import { CoverArt } from "../../components/CoverArt";
import { findRadioStations, RADIO_FALLBACK_ART } from "../../services/radioBrowser";
import { useMusic } from "../../state/MusicProvider";
import type { Station } from "../../types/music";

const categories = [
  "All", "Rock", "Pop", "Country", "Christian", "Gospel", "Jazz", "Classical",
  "News", "Talk", "Sports", "Electronic", "Hip-Hop", "World", "Favorites",
] as const;
type Category = (typeof categories)[number];
const countries = [
  ["", "Worldwide"], ["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"],
  ["AU", "Australia"], ["DE", "Germany"], ["FR", "France"], ["ES", "Spain"],
  ["IT", "Italy"], ["BR", "Brazil"], ["JP", "Japan"], ["IN", "India"],
] as const;

const LIMIT = 35;

export function RadioPage() {
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState<"votes" | "name" | "bitrate">("votes");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [customError, setCustomError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const { playStation, station, playbackError, favoriteStations, favoriteStationRecords,
    toggleFavoriteStation, customStations, addCustomStation, removeCustomStation,
    addRadioResults } = useMusic();

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  useEffect(() => { setPage(0); setResults([]); }, [category, debouncedSearch, country, sort]);

  useEffect(() => {
    if (category === "Favorites") { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void findRadioStations({
      name: debouncedSearch,
      tag: category === "All" ? undefined : category,
      countrycode: country || undefined,
      order: sort,
      offset: page * LIMIT,
      limit: LIMIT,
    }, controller.signal)
      .then((fetched) => {
        setResults((prev) => page === 0 ? fetched :
          [...new Map([...prev, ...fetched].map((s) => [s.id, s])).values()]);
        addRadioResults(fetched);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Radio directory unavailable. Try again.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [category, debouncedSearch, country, sort, page, refresh, addRadioResults]);

  const filteredCustom = customStations.filter((s) =>
    (category === "All" || category === "Favorites" || s.genre.toLowerCase().includes(category.toLowerCase())) &&
    (!search.trim() || (s.name + " " + s.genre).toLowerCase().includes(search.trim().toLowerCase())));
  const visible = category === "Favorites"
    ? favoriteStationRecords.filter((s) => !search.trim() || (s.name + " " + s.genre).toLowerCase().includes(search.trim().toLowerCase()))
    : [...filteredCustom, ...results.filter((s) => !filteredCustom.some((c) => c.streamUrl === s.streamUrl))];

  const addManual = (event: FormEvent) => {
    event.preventDefault();
    setCustomError("");
    try {
      addCustomStation(customName, customUrl, customGenre);
      setCustomName(""); setCustomUrl(""); setCustomGenre("");
      setShowCustom(false);
      setCategory("All");
      setSearch("");
    } catch (cause) {
      setCustomError(cause instanceof Error ? cause.message : "Please check the station details.");
    }
  };

  return (
    <div className="page radio-page">
      <header className="page-header">
        <div><h1>Radio</h1><p className="page-subtitle">Live stations from around the world</p></div>
        <button type="button" className="icon-button" onClick={() => setShowCustom((v) => !v)}
          aria-label="Add custom station" aria-expanded={showCustom}>
          {showCustom ? <X size={24}/> : <Plus size={25}/>}
        </button>
      </header>

      <div className="search-field">
        <Search size={19}/>
        <input type="search" autoComplete="off" aria-label="Search radio stations"
          placeholder="Search any radio station..." value={search} onChange={(e) => setSearch(e.target.value)}/>
        {search && <button type="button" aria-label="Clear radio search" onClick={() => setSearch("")}><X size={18}/></button>}
      </div>
      <div className="pill-row scroll-pills radio-categories" role="group" aria-label="Radio genres">
        {categories.map((entry) =>
          <button type="button" key={entry} className={"pill" + (category === entry ? " active" : "")}
            aria-pressed={category === entry} onClick={() => setCategory(entry)}>{entry}</button>)}
      </div>

      <div className="radio-filters">
        <label><Globe2 size={17}/><span className="sr-only">Country</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Filter by country"
            disabled={category === "Favorites"}>
            {countries.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </label>
        <label><span className="sr-only">Sort radio stations</span>
          <select value={sort} onChange={(e) => { const value = e.target.value; if (value === "votes" || value === "name" || value === "bitrate") setSort(value); }} aria-label="Sort radio stations"
            disabled={category === "Favorites"}>
            <option value="votes">Most popular</option>
            <option value="name">Name A–Z</option>
            <option value="bitrate">Highest bitrate</option>
          </select>
        </label>
        <button type="button" className="radio-refresh" onClick={() => setRefresh((n) => n + 1)}
          disabled={loading || category === "Favorites"} aria-label="Refresh radio stations">
          <RefreshCw size={18}/>
        </button>
      </div>

      {showCustom && (
        <form className="radio-custom-form" onSubmit={addManual}>
          <h2>Add a Station</h2>
          <p className="footnote">Paste the station's direct HTTPS audio stream address, not its website homepage.</p>
          <label>Station name<input required maxLength={90} value={customName} onChange={(e) => setCustomName(e.target.value)}
            placeholder="My favorite station"/></label>
          <label>Stream URL<input required type="url" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://radio.example.com/stream"/></label>
          <label>Genre (optional)<input value={customGenre} maxLength={50} onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Rock, News, Christian, Jazz..."/></label>
          {customError && <p role="alert" className="radio-error">{customError}</p>}
          <button className="primary-button" type="submit"><Plus size={18}/> Save Station</button>
        </form>
      )}

      {station && <div className="radio-current"><RadioTower size={18}/><div><strong>Selected: {station.name}</strong>
        <span>{playbackError ? playbackError : "Use the bottom player to pause or resume."}</span></div></div>}

      {category !== "Favorites" && customStations.length > 0 && <p className="footnote">Your custom stations appear before directory results.</p>}
      <section className="page-section">
        <div className="section-title"><h2>{category === "Favorites" ? "Favorite Stations" : "Stations"}</h2>
          {loading && <LoaderCircle size={19} className="radio-spinner" aria-label="Loading stations"/>}</div>

        {error && <div className="radio-error" role="alert">{error}
          <button type="button" onClick={() => setRefresh((n) => n + 1)}>Try again</button></div>}

        <div className="library-list radio-list">
          {visible.map((entry) => (
            <div className="music-list-row" key={entry.id}>
              <button type="button" className="music-list-row__main" onClick={() => playStation(entry)}
                aria-label={"Play " + entry.name}>
                <CoverArt src={entry.cover || RADIO_FALLBACK_ART} alt=""/>
                <span><strong>{entry.name}</strong><small>{entry.genre}{entry.country ? " · " + entry.country : ""}</small>
                  {entry.bitrate ? <small>{entry.codec} · {entry.bitrate} kbps</small> : null}</span>
              </button>
              <button type="button" className={"icon-button" + (favoriteStations.includes(entry.id) ? " selected" : "")}
                onClick={() => toggleFavoriteStation(entry.id)} aria-label={(favoriteStations.includes(entry.id) ? "Remove favorite " : "Favorite ") + entry.name}>
                <Heart size={20} fill={favoriteStations.includes(entry.id) ? "currentColor" : "none"}/>
              </button>
              {entry.source === "custom" && <button type="button" className="icon-button" onClick={() => removeCustomStation(entry.id)}
                aria-label={"Remove custom station " + entry.name}><Trash2 size={18}/></button>}
            </div>
          ))}
        </div>

        {!loading && !visible.length && !error &&
          <p className="empty-state">{category === "Favorites" ?
            "No favorite stations yet. Tap the heart on any station to save it." :
            "No playable HTTPS stations matched. Try a different genre, country or search."}</p>}
        {loading && !visible.length && <p className="radio-loading" role="status">Finding live radio stations…</p>}
        {!loading && category !== "Favorites" && !error && results.length >= LIMIT &&
          <button type="button" className="radio-load-more" onClick={() => setPage((p) => p + 1)}>Load more stations</button>}
      </section>
      <p className="footnote">Radio directory powered by Radio Browser. Station availability and browser-compatible streams vary.
        Only secure HTTPS streams are displayed. Favorites and custom stations are stored on this device until account sync is available.</p>
    </div>
  );
}
