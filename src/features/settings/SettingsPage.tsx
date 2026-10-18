import { ArrowLeft, Check, CloudOff, Moon, Smartphone, Sun, Users } from "lucide-react";
import { useMusic } from "../../state/MusicProvider";
import type { Appearance } from "../../types/music";

const modes: { id: Appearance; label: string; desc: string; Icon: typeof Sun }[] = [
  { id: "light", label: "Light", desc: "Always use the light appearance", Icon: Sun },
  { id: "dark", label: "Dark", desc: "Always use the dark appearance", Icon: Moon },
  { id: "system", label: "Same as System", desc: "Match this device automatically", Icon: Smartphone },
];

export function SettingsPage({ onClose }: { onClose: () => void }) {
  const { appearance, setAppearance } = useMusic();
  return (
    <div className="page settings-page">
      <header className="page-header"><div className="header-title-stack">
        <button type="button" className="back-link" onClick={onClose}><ArrowLeft size={17}/> Back</button>
        <h1>Settings</h1>
      </div></header>
      <section className="page-section">
        <h2>Appearance</h2>
        <div className="settings-group">
          {modes.map(({ id, label, desc, Icon }) => <button key={id} type="button" className="settings-row" onClick={() => setAppearance(id)}>
            <Icon size={22}/><span><strong>{label}</strong><small>{desc}</small></span>
            {appearance === id && <Check className="settings-check" size={21}/>}
          </button>)}
        </div>
        <p className="footnote">Same as System is the default. This prototype remembers your selection on this device; syncing preferences across accounts comes with login integration.</p>
      </section>
      <section className="page-section">
        <h2>Family</h2>
        <div className="settings-group">
          <div className="settings-row static"><Users size={21}/><span><strong>Family Accounts</strong><small>Account invitations and management come with the backend integration.</small></span></div>
        </div>
      </section>
      <section className="page-section">
        <h2>Server</h2>
        <div className="settings-group">
          <div className="settings-row static"><CloudOff size={21}/><span><strong>Navidrome not connected</strong><small>Showing an interactive interface preview with sample songs.</small></span></div>
        </div>
      </section>
    </div>
  );
}
