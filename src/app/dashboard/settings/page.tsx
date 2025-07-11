
'use client';

import Link from 'next/link';
import { UserCog, Shield, Lock, ChevronRight, Palette } from 'lucide-react';

const settingsOptions = [
  {
    href: '/dashboard/settings/account',
    icon: UserCog,
    title: 'Conta',
    description: 'Gerencie os detalhes da sua conta e preferências.',
  },
  {
    href: '/dashboard/settings/security',
    icon: Shield,
    title: 'Segurança',
    description: 'Altere sua senha e gerencie a segurança da conta.',
  },
  {
    href: '/dashboard/settings/privacy',
    icon: Lock,
    title: 'Privacidade',
    description: 'Controle suas informações e quem pode interagir com você.',
  },
  {
    href: '/dashboard/settings/themes',
    icon: Palette,
    title: 'Temas',
    description: 'Personalize a aparência da aplicação.',
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-2">
      {settingsOptions.map((option) => (
        <Link
          href={option.href}
          key={option.href}
          className="flex items-center p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
        >
          <option.icon className="h-6 w-6 mr-4 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold">{option.title}</h3>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      ))}
    </div>
  );
}
