export function Panel({ title, children, actions, dense }: { title: string; children: React.ReactNode; actions?: React.ReactNode; dense?: boolean }) {
  return (
    <section className="panel flex flex-col h-full min-h-0">
      <div className={`panel-header flex items-center justify-between flex-shrink-0 ${dense ? 'px-2 py-1 text-[11px]' : ''}`}>
        <h2 className={`font-medium ${dense ? 'text-[12px]' : ''}`}>{title}</h2>
        {actions && <div className={`text-xs ${dense ? 'text-[11px]' : ''}`}>{actions}</div>}
      </div>
      <div className={`panel-body ${dense ? 'p-2 text-sm' : ''} min-h-0 flex-1 overflow-auto`}>{children}</div>
    </section>
  )
}
