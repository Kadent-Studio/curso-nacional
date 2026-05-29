import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth";
import { AdminShell } from "@/src/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <AdminShell name={user.name} role={user.role}>
      {children}
    </AdminShell>
  );
}
