
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMainSettingsPage = pathname === '/dashboard/settings';

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-4xl mx-auto animate-in fade-in-0 zoom-in-95 duration-500 cyber-card">
        <CardHeader>
          <div className="flex items-center gap-4">
             {!isMainSettingsPage && (
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/dashboard/settings">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only">Voltar</span>
                </Link>
              </Button>
            )}
            <div className="flex items-center gap-2 font-headline">
                <Settings className="h-6 w-6" />
                <CardTitle>Configurações</CardTitle>
            </div>
          </div>
          <CardDescription className={!isMainSettingsPage ? 'pl-12' : ''}>
            Gerencie as preferências da sua conta e da aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
