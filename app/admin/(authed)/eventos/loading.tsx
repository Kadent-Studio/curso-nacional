import { Skeleton } from "@/src/components/admin/skeleton";

export default function EventosLoading() {
  return (
    <div>
      <header className="flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-11 w-36" />
      </header>

      <div className="mt-8 border border-ink/15 bg-paper">
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
    </div>
  );
}
