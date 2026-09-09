import { Menu } from "lucide-react";

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:hidden">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-1.5 text-brand-800 hover:bg-brand-50"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-brand-950">{title}</h1>
    </header>
  );
}
