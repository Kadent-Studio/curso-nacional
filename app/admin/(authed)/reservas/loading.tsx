import { Skeleton } from "@/src/components/admin/skeleton";

export default function ReservasLoading() {
  return (
    <div>
      <header className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-64" />
        </div>
        <Skeleton className="h-3 w-32" />
      </header>

      <div className="mt-8 flex gap-3 border-b border-ink/15 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-32 shrink-0" />
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-12 w-28" />
      </div>

      <div className="mt-8 border border-ink/15 bg-paper">
        <div className="grid grid-cols-7 gap-4 border-b border-ink/10 bg-paper-deep px-4 py-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3" />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0">
            {Array.from({ length: 7 }).map((__, j) => (
              <Skeleton key={j} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
