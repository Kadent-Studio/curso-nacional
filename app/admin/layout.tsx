// Pass-through. Children (login or (authed)) decide their own chrome.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
