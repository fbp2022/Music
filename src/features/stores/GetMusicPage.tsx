import { useRef, useState, type ChangeEvent } from "react";
import { ArrowUpRight, FileAudio, FolderOpen, Info, UploadCloud } from "lucide-react";
import { stores } from "../../data/demo";
import type { Store } from "../../types/music";

export function GetMusicPage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<Store["id"] | "other">("other");
  const [selected, setSelected] = useState<{ name: string; size: number }[]>([]);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelected(files.map((file) => ({ name: file.name, size: file.size })));
  };

  return (
    <div className="page">
      <header className="page-header"><h1>Get Music</h1></header>
      <p className="page-intro">Buy from a music store using your own account. Then add the downloaded files to the shared family library.</p>
      <section className="page-section">
        <h2>Choose a Store</h2>
        <div className="store-list">
          {stores.map((store) => (
            <a key={store.id} className="store-card" href={store.link} target="_blank" rel="noopener noreferrer"
              onClick={() => setSource(store.id)} aria-label={"Open " + store.name + " in your browser"}>
              <span className={"store-logo store-logo--" + store.id}>{store.id === "qobuz" ? "Q" : store.id === "bandcamp" ? "b" : "HD"}</span>
              <span><strong>{store.name}</strong><small>{store.category}</small><em>{store.details}</em></span>
              <ArrowUpRight size={20}/>
            </a>
          ))}
        </div>
        <p className="footnote">Purchases happen on each store's own website. We never request or share store credentials.</p>
      </section>
      <section className="page-section">
        <h2>After You Purchase</h2>
        <div className="steps">
          <div><b>1</b><span>Purchase from the store with your own account.</span></div>
          <div><b>2</b><span>Download the audio files or album ZIP to Files on your iPhone or computer.</span></div>
          <div><b>3</b><span>Select the files here for the family-library import.</span></div>
        </div>
      </section>
      <section className="page-section">
        <h2>Import Purchased Music</h2>
        <div className="import-panel">
          <UploadCloud size={33} className="import-icon"/>
          <strong>Choose Music Files</strong>
          <span>MP3, AAC, M4A, FLAC, WAV, ALAC or ZIP</span>
          <label htmlFor="music-source">Purchased from</label>
          <select id="music-source" value={source} onChange={(event) => setSource(event.target.value as Store["id"] | "other")}>
            <option value="other">Other / CD / Not specified</option>
            {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </select>
          <input ref={fileInput} type="file" className="sr-only" accept=".mp3,.m4a,.aac,.flac,.wav,.alac,.aiff,.zip,audio/*" multiple onChange={onFiles}/>
          <button type="button" className="primary-button" onClick={() => fileInput.current?.click()}><FolderOpen size={19}/> Choose Files</button>
        </div>
        {selected.length > 0 && <div className="selected-files"><h3>Selected for Import ({selected.length})</h3>
          {selected.map((file, i) => <div className="selected-file" key={file.name + i}><FileAudio size={18}/><span>{file.name}</span><small>{(file.size / (1024 * 1024)).toFixed(1)} MB</small></div>)}
        </div>}
        <div className="info-banner"><Info size={17}/><p><strong>Prototype only:</strong> file selection works, but nothing is uploaded or imported yet. The secure upload service will be added alongside Navidrome.</p></div>
      </section>
    </div>
  );
}
