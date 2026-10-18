import { House, Library, RadioTower, Search, ShoppingBag } from "lucide-react";
import { useMusic } from "../state/MusicProvider";
import type { Tab } from "../types/music";

const items: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: "home", label: "Home", Icon: House },
  { id: "library", label: "Library", Icon: Library },
  { id: "radio", label: "Radio", Icon: RadioTower },
  { id: "get-music", label: "Get Music", Icon: ShoppingBag },
  { id: "search", label: "Search", Icon: Search },
];

export function BottomNav() {
  const { tab, goTo } = useMusic();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(({ id, label, Icon }) => (
        <button key={id} className={"nav-item" + (tab === id ? " active" : "")} aria-current={tab === id ? "page" : undefined}
          onClick={() => goTo(id)} type="button">
          <Icon aria-hidden="true" size={22} strokeWidth={tab === id ? 2.5 : 1.8} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
