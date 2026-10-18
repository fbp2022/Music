import { CircleUserRound, Settings2 } from "lucide-react";
import { useMusic } from "../state/MusicProvider";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { goTo } = useMusic();
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <button type="button" className="icon-button profile-button" aria-label="Appearance and settings"
        onClick={() => goTo("home") || document.dispatchEvent(new Event("fm-open-settings"))}>
        <CircleUserRound size={26} strokeWidth={1.8} />
      </button>
    </header>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="icon-button" onClick={onClick} aria-label="Open settings"><Settings2 size={23}/></button>;
}
