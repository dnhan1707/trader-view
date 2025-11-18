export function Panel({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-header flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        {actions && <div className="text-xs">{actions}</div>}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  )
}
