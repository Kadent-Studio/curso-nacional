import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { AdminSidebar } from "@/src/components/admin/sidebar";

export const dynamic = "force-dynamic";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh bg-paper">
      <AdminSidebar name={user.name} role={user.role} />
      <div className="flex-1 overflow-x-hidden">
        <main className="mx-auto max-w-[1200px] px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
