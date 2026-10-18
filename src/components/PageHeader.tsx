import { CircleUserRound, Settings2 } from "lucide-react";

export function PageHeader({ title, subtitle, onOpenSettings }: {
  title: string;
  subtitle?: string;
  onOpenSettings: () => void;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <button type="button" className="icon-button profile-button" aria-label="Appearance and settings"
        onClick={onOpenSettings}>
        <CircleUserRound size={26} strokeWidth={1.8} />
      </button>
    </header>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="icon-button" onClick={onClick} aria-label="Open settings"><Settings2 size={23}/></button>;
}
