import { Skeleton } from "@/src/components/admin/skeleton";

export default function ConfigLoading() {
  return (
    <div>
      <header className="space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-4 w-96" />
      </header>

      <div className="my-10 h-px bg-ink/15" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr]">
        <section className="space-y-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-56 w-full" />
        </section>
        <section className="space-y-6">
          <Skeleton className="h-3 w-32" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </section>
      </div>
    </div>
  );
}
