'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Code, Github, UserCircle, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-500 cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Info className="h-6 w-6" />
            Sobre o Chitter
          </CardTitle>
          <CardDescription>Informações e créditos da aplicação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <div className="space-y-1">
            <h3 className="font-semibold">Versão</h3>
            <p className="text-muted-foreground">1.4.0</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Desenvolvido por</h3>
            <p className="text-muted-foreground flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Josyel Buenos
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Repositório GitHub</h3>
            <p className="text-muted-foreground flex items-center gap-2">
                <Github className="h-4 w-4" />
                (em breve)
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Tecnologias Utilizadas</h3>
            <p className="text-muted-foreground flex items-center gap-2">
                <Code className="h-4 w-4" />
                Construído com Next.js, React, Firebase, Tailwind CSS e Genkit.
            </p>
          </div>
           <div className="pt-4 text-center text-xs text-muted-foreground/80 flex items-center justify-center gap-1.5">
              Feito com <Heart className="h-4 w-4 text-primary/80" /> para a web moderna.
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
