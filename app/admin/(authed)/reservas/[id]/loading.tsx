import { Skeleton } from "@/src/components/admin/skeleton";

export default function ReservaDetailLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-40" />
      <header className="mt-4 flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-72" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-7 w-32" />
      </header>

      <div className="my-10 h-px bg-ink/15" />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <section key={i} className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-24 w-full" />
            </section>
          ))}
        </div>
        <aside className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </aside>
      </div>
    </div>
  );
}
