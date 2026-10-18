import { useEffect, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { MiniPlayer } from "../components/MiniPlayer";
import { HomePage } from "../features/home/HomePage";
import { LibraryPage } from "../features/library/LibraryPage";
import { PlayerOverlay } from "../features/player/PlayerOverlay";
import { RadioPage } from "../features/radio/RadioPage";
import { SearchPage } from "../features/search/SearchPage";
import { SettingsPage } from "../features/settings/SettingsPage";
import { GetMusicPage } from "../features/stores/GetMusicPage";
import { MusicProvider, useMusic } from "../state/MusicProvider";

function MusicAppShell() {
  const { tab } = useMusic();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Bottom navigation should always take users to the destination they selected.
    setSettingsOpen(false);
  }, [tab]);

  return (
    <div className="app-shell">
      <main className="page-scroll" id="main-content">
        {settingsOpen ? <SettingsPage onClose={() => setSettingsOpen(false)}/> : (
          <>
            {tab === "home" && <HomePage onOpenSettings={() => setSettingsOpen(true)}/>}
            {tab === "library" && <LibraryPage onOpenSettings={() => setSettingsOpen(true)}/>}
            {tab === "radio" && <RadioPage/>}
            {tab === "get-music" && <GetMusicPage/>}
            {tab === "search" && <SearchPage/>}
          </>
        )}
      </main>
      <div className="app-bottom">
        <MiniPlayer/>
        <BottomNav/>
      </div>
      <PlayerOverlay/>
    </div>
  );
}

export function App() {
  return <MusicProvider><MusicAppShell/></MusicProvider>;
}
