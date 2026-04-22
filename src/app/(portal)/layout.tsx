import { Sidebar } from "@/components/layout/sidebar";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex flex-row overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-lilac/5 via-transparent to-transparent pointer-events-none" />
        {children}
      </main>
    </div>
  );
}
