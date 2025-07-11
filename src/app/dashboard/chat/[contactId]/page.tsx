'use client';

import ChatView from '@/components/chat-view';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { use, Suspense } from 'react';

function ChatPageContent({ contactId }: { contactId: string }) {
  const { loading } = useAuth();
  if (loading) {
    return (
       <div className="flex flex-col h-full">
         <header className="flex items-center p-4 border-b">
           <Skeleton className="h-10 w-10 rounded-full mr-4" />
           <Skeleton className="h-6 w-32" />
         </header>
         <div className="flex-1 p-4 space-y-4">
           <div className="flex justify-start">
             <Skeleton className="h-16 w-64 rounded-lg" />
           </div>
           <div className="flex justify-end">
             <Skeleton className="h-24 w-48 rounded-lg" />
           </div>
            <div className="flex justify-start">
             <Skeleton className="h-12 w-32 rounded-lg" />
           </div>
         </div>
         <footer className="p-4 border-t">
           <Skeleton className="h-10 w-full rounded-lg" />
         </footer>
       </div>
    )
  }
  return <ChatView contactId={contactId} />;
}

export default function ChatPage({ params }: { params: Promise<{ contactId:string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ChatPageContent contactId={resolvedParams.contactId} />
    </Suspense>
  )
}
