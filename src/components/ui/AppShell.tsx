'use client';

import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const { data: session } = useSession();
  const { isCollapsed } = useSidebar();
  const userRole = session?.user?.role || 'user';
  const user = session?.user;

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-row overflow-hidden h-[calc(100vh-48px)] min-h-0 max-h-[calc(100vh-48px)]">
        <Sidebar userRole={userRole} user={user} />
        <main
          className={cn(
            'flex-1 min-h-0 flex flex-col relative overflow-auto transition-all duration-300',
            isCollapsed ? 'p-6' : 'p-6'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  );
}
