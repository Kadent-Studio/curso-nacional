import { Skeleton } from "@/src/components/admin/skeleton";

export default function DashboardLoading() {
  return (
    <div>
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-56" />
        </div>
        <Skeleton className="h-3 w-40" />
      </header>

      <section className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-ink/15 bg-paper p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-9 w-24" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </section>

      <section className="mt-12">
        <Skeleton className="h-7 w-64" />
        <div className="mt-5 border border-ink/15 bg-paper">
          <div className="grid grid-cols-6 gap-4 border-b border-ink/10 bg-paper-deep px-4 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0">
              {Array.from({ length: 6 }).map((__, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
