import { SiteHeader } from "@/src/components/site-header";
import { SiteFooter } from "@/src/components/site-footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
