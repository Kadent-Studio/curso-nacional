import { Skeleton } from "@/src/components/admin/skeleton";

export default function EventoEditLoading() {
  return (
    <div>
      <Skeleton className="h-3 w-32" />
      <header className="mt-4 flex items-end justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-96" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-11 w-28" />
      </header>

      <div className="my-10 h-px bg-ink/15" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4 border border-ink/15 bg-paper p-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </section>
        <aside className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-40 w-full" />
          </div>
        </aside>
      </div>
    </div>
  );
}
