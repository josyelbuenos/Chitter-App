"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import SidebarContents from '@/components/sidebar-contents';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, totalUnreadCount } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (totalUnreadCount > 0) {
        document.title = `(${totalUnreadCount}) Chitter`;
    } else {
        document.title = 'Chitter';
    }
  }, [totalUnreadCount]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex w-full h-full">
            <div className="hidden md:flex flex-col w-72 border-r bg-card/50 p-4 space-y-4 cyber-card">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <div className="flex-1 space-y-2 pt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="flex-1 p-4">
                <Skeleton className="h-full w-full rounded-lg" />
            </div>
        </div>
      </div>
    );
  }
  
  const isChatPage = pathname.startsWith('/dashboard/chat/');

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContents />
      </Sidebar>
      <SidebarInset className={cn(isChatPage && 'overflow-hidden')}>
        {!isChatPage && (
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
            <SidebarTrigger />
            <div className="flex-1 text-center">
               <div className="inline-flex items-center gap-2 font-headline">
                  <MessageSquareDashed className="h-6 w-6 text-primary" />
                  <h1 className="text-lg font-bold">Chitter</h1>
              </div>
            </div>
            <div className="w-7" /> {/* Spacer to balance the trigger button */}
          </header>
        )}
        <div className={cn("flex-1", isChatPage && 'h-full')}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
