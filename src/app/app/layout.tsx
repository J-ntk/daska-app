import AppShell from "@/components/AppShell";
import { getShellData } from "@/lib/getShellData";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projects, notifications, unreadCount } = await getShellData();

  return (
    <AppShell projects={projects} notifications={notifications} unreadCount={unreadCount}>
      {children}
    </AppShell>
  );
}