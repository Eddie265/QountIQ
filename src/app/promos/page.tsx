import { mockPromos } from "@/data/mockData";

export default function PromosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Partner programs</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Unlock curated financial perks for your organization
          </p>
        </div>
        <button className="btn-primary">Request custom offer</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockPromos.map((promo) => (
          <div key={promo.id} className="card flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                {promo.partner}
              </p>
              <h2 className="text-lg font-semibold">{promo.title}</h2>
            </div>
            <p className="text-sm text-[var(--text-muted)] flex-1">
              {promo.description}
            </p>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Expires {promo.expiresOn}</span>
              <button className="btn-secondary text-xs px-3 py-1">
                {promo.ctaLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



