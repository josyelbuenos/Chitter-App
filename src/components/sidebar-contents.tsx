'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { auth, db } from '@/lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator, SidebarMenuBadge, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, UserPlus, User, Users, Info, Settings, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { Contact, GroupProfile, UserProfile } from '@/lib/types';
import { CreateGroupDialog } from '@/components/create-group-dialog';
import { getDirectChatId } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function SidebarContents() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { isMobile, setOpenMobile } = useSidebar();
  const [newContactNumber, setNewContactNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [chatPartners, setChatPartners] = useState<{[key: string]: Partial<UserProfile>}>({});
  
  const unreadCounts = userProfile?.unreadCounts || {};

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  useEffect(() => {
    if (!userProfile?.groups) {
      setGroups([]);
      return;
    }

    const groupIds = Object.keys(userProfile.groups);
    const listeners: { [key: string]: () => void } = {};

    groupIds.forEach(groupId => {
        const groupRef = ref(db, `groups/${groupId}`);
        listeners[groupId] = onValue(groupRef, (snapshot) => {
            if (snapshot.exists()) {
                const groupData = { ...snapshot.val(), id: groupId } as GroupProfile;
                setGroups(prevGroups => {
                    const index = prevGroups.findIndex(g => g.id === groupId);
                    if (index > -1) {
                        const newGroups = [...prevGroups];
                        newGroups[index] = groupData;
                        return newGroups;
                    }
                    return [...prevGroups, groupData];
                });
            } else {
                setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
            }
        });
    });

    return () => {
        Object.values(listeners).forEach(unsubscribe => unsubscribe());
    };
  }, [userProfile?.groups]);


  const { groupChatIds, directChatIds } = useMemo(() => {
    const allIds = new Set<string>();
    if (!userProfile?.number) return { groupChatIds: [], directChatIds: [] };

    if (userProfile.groups) Object.keys(userProfile.groups).forEach(id => allIds.add(`group_${id}`));
    if (userProfile.contacts) Object.keys(userProfile.contacts).forEach(num => allIds.add(getDirectChatId(userProfile.number, num)));
    if (userProfile.unreadCounts) Object.keys(userProfile.unreadCounts).forEach(id => allIds.add(id));

    const groupChatIds: string[] = [];
    const directChatIds: string[] = [];
    
    const sortedIds = Array.from(allIds).sort((a, b) => {
        const aIsGroup = a.startsWith('group_');
        const bIsGroup = b.startsWith('group_');
        if (aIsGroup && !bIsGroup) return -1;
        if (!aIsGroup && bIsGroup) return 1;
        return 0; 
    });

    sortedIds.forEach(id => {
      if (id.startsWith('group_')) {
        groupChatIds.push(id.substring(6));
      } else {
        directChatIds.push(id);
      }
    });

    return { groupChatIds, directChatIds };
  }, [userProfile?.groups, userProfile?.contacts, userProfile?.unreadCounts, userProfile?.number]);

  useEffect(() => {
    if (!userProfile?.number || directChatIds.length === 0) return;

    const numbersToFetch = new Set<string>();
    directChatIds.forEach(chatId => {
      const partnerNumber = chatId.split('_').find(n => n !== userProfile.number);
      if (partnerNumber && !userProfile.contacts?.[partnerNumber] && !chatPartners[partnerNumber]) {
        numbersToFetch.add(partnerNumber);
      }
    });

    if (numbersToFetch.size > 0) {
      const fetchProfiles = async () => {
        const newPartners: { [number: string]: Partial<UserProfile> } = {};
        for (const number of Array.from(numbersToFetch)) {
          try {
            const numberSnap = await get(ref(db, `numbers/${number}`));
            if (numberSnap.exists()) {
              const { uid } = numberSnap.val();
              const userSnap = await get(ref(db, `users/${uid}`));
              if (userSnap.exists()) {
                newPartners[number] = { uid, ...userSnap.val() };
              }
            } else {
              newPartners[number] = { username: number, displayName: number };
            }
          } catch (error) {
            console.error(`Failed to fetch profile for number ${number}`, error);
            newPartners[number] = { username: number, displayName: number };
          }
        }
        if (Object.keys(newPartners).length > 0) {
          setChatPartners(prev => ({ ...prev, ...newPartners }));
        }
      };
      fetchProfiles();
    }
  }, [directChatIds, userProfile?.contacts, userProfile?.number, chatPartners]);


  const handleLogout = async () => {
    await auth.signOut();
    toast({ title: "Sessão Encerrada", description: "Você saiu da sua conta com sucesso." });
    router.push('/login');
  };
  
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const contactNum = newContactNumber.trim();
    if (!contactNum || contactNum.length !== 7 || !/^\d+$/.test(contactNum)) {
      toast({ title: "Número Inválido", description: "Por favor, digite um número de 7 dígitos válido.", variant: "destructive" });
      setIsAdding(false);
      return;
    }
    if (contactNum === userProfile?.number) {
        toast({ title: "Opa!", description: "Você não pode enviar uma mensagem para si mesmo."});
        setIsAdding(false);
        return;
    }
    
    router.push(`/dashboard/chat/${contactNum}`);
    setNewContactNumber('');
    setIsNewChatOpen(false);
    setIsAdding(false);
    handleLinkClick();
  };

  return (
    <>
      <CreateGroupDialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen} />
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
            <Avatar>
                <AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile?.displayName} />
                <AvatarFallback>{(userProfile?.displayName || userProfile?.username || 'C')?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-semibold">{userProfile?.displayName || userProfile?.username}</span>
                <span className="text-sm text-muted-foreground font-mono">{userProfile?.number}</span>
            </div>
        </div>
        
        <div className="px-2 space-y-2">
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                    <Button size="sm" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4"/>
                        Nova Conversa
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Iniciar Nova Conversa</DialogTitle>
                        <DialogDescription>
                            Digite o ID de 7 dígitos do usuário para quem você quer enviar uma mensagem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStartChat} className="space-y-4 pt-4">
                        <Input 
                            placeholder="Digite o ID de 7 dígitos"
                            value={newContactNumber}
                            onChange={(e) => setNewContactNumber(e.target.value)}
                            disabled={isAdding}
                            maxLength={7}
                            autoFocus
                        />
                        <DialogFooter>
                             <Button type="submit" className="w-full" disabled={isAdding}>
                                 {isAdding ? "Iniciando..." : "Iniciar Conversa"}
                             </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" className="w-full" onClick={() => setIsCreateGroupOpen(true)}>
                <Users className="mr-2 h-4 w-4"/>
                Criar Grupo
            </Button>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {groupChatIds.length > 0 && (
             <div className="px-3 text-xs font-semibold text-muted-foreground uppercase my-2">Grupos</div>
          )}
          {groupChatIds.map((groupId, index) => {
              const group = groups.find(g => g.id === groupId);
              if (!group) return null;
              const unreadCount = Number(unreadCounts[`group_${groupId}`] || 0);
              return (
              <SidebarMenuItem 
                key={group.id}
                className="animate-in fade-in-0"
                style={{ animationDelay: `${150 + index * 50}ms` }}
              >
                <Link href={`/dashboard/chat/group_${group.id}`} className="w-full" onClick={handleLinkClick}>
                  <SidebarMenuButton className="w-full justify-start gap-3" isActive={pathname === `/dashboard/chat/group_${group.id}`}>
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={group.photoURL || undefined} alt={group.name} />
                          <AvatarFallback><Users className="h-4 w-4"/></AvatarFallback>
                      </Avatar>
                      <span>{group.name}</span>
                      {unreadCount > 0 && <SidebarMenuBadge className="ml-auto bg-destructive">{unreadCount}</SidebarMenuBadge>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          )})}

          {directChatIds.length > 0 && (
             <div className="px-3 text-xs font-semibold text-muted-foreground uppercase my-2">Mensagens Diretas</div>
          )}
          {directChatIds.map((chatId, index) => {
            if (!userProfile?.number) return null;
            const partnerNumber = chatId.split('_').find(n => n !== userProfile.number);
            if (!partnerNumber) return null;

            const contact = userProfile.contacts?.[partnerNumber];
            const partnerProfile = chatPartners[partnerNumber];
            
            const displayName = contact?.displayName || partnerProfile?.displayName || partnerNumber;
            const photoURL = contact?.photoURL || partnerProfile?.photoURL;
            const fallback = (displayName || ' ').charAt(0).toUpperCase();

            const unreadCount = Number(unreadCounts[chatId] || 0);

            return (
              <SidebarMenuItem 
                key={chatId}
                className="animate-in fade-in-0"
                style={{ animationDelay: `${150 + (groupChatIds.length + index) * 50}ms` }}
              >
                <Link href={`/dashboard/chat/${partnerNumber}`} className="w-full" onClick={handleLinkClick}>
                  <SidebarMenuButton className="w-full justify-start gap-3" isActive={pathname.endsWith(`/chat/${partnerNumber}`)}>
                      <Avatar className="h-8 w-8">
                          <AvatarImage src={photoURL || undefined} alt={displayName} />
                          <AvatarFallback>{fallback}</AvatarFallback>
                      </Avatar>
                      <span className="truncate">{displayName}</span>
                      {unreadCount > 0 && <SidebarMenuBadge className="ml-auto bg-destructive">{unreadCount}</SidebarMenuBadge>}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
          {groupChatIds.length === 0 && directChatIds.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
                Sua lista de contatos está vazia. Adicione alguém para começar a conversar.
            </div>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Link href="/dashboard/settings" className="w-full" onClick={handleLinkClick}>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </Button>
        </Link>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    Opções
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                 <DropdownMenuItem asChild>
                    <Link href="/dashboard/about" onClick={handleLinkClick}>
                        <Info className="mr-2 h-4 w-4" />
                        <span>Sobre</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" onClick={handleLinkClick}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Perfil</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="!text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
