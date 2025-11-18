type Tab = { id: string; label: string }

export function Sidebar({ tabs, active, onSelect }: { tabs: Tab[]; active: string; onSelect: (id: string) => void }) {
  return (
    <nav className="h-full p-2">
      <div className="text-xs text-terminal-muted px-2 mb-2 uppercase tracking-wider">Navigator</div>
      <ul className="space-y-1">
        {tabs.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onSelect(t.id)}
              className={`w-full text-left px-3 py-2 rounded border ${
                active === t.id ? 'bg-terminal-panel border-terminal-accent/40 text-terminal-text' : 'border-transparent text-terminal-muted hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-xs text-terminal-muted px-2">
        Tips: Press <kbd className="kbd">/</kbd> to focus search
      </div>
    </nav>
  )
}
