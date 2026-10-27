export default function Loading() {
  return (
    <div className="animate-pulse space-y-5" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-40 rounded-lg bg-[var(--bar-muted)]" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="panel h-28" />
        ))}
      </div>
      <div className="panel h-72" />
      <div className="panel h-56" />
    </div>
  );
}
