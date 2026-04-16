import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { AuthProvider } from '@/lib/auth/context';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <DashboardSidebar />
          <main className="flex-1 overflow-auto">
            <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-lg font-semibold text-foreground">SchedulAI Dashboard</h1>
              </div>
              <DashboardHeader />
            </div>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
