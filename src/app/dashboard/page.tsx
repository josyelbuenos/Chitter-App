import { MessageSquareDashed } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background p-4 text-center rounded-xl">
      <MessageSquareDashed className="h-16 w-16 text-primary mb-4 animate-float" />
      <h2 className="text-2xl font-bold font-headline animate-text-flicker-once">Bem-vindo ao Chitter</h2>
      <p 
        className="text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
        style={{ animationDelay: '200ms' }}
      >
        Selecione um contato na barra lateral para iniciar uma conversa.
      </p>
    </div>
  );
}
