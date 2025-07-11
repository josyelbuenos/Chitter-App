"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareDashed } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <MessageSquareDashed className="h-16 w-16 text-primary" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-headline">Chitter</h1>
          <p className="text-muted-foreground">Carregando seu mundo anônimo...</p>
        </div>
      </div>
    </div>
  );
}
