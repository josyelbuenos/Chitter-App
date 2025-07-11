'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db, storage } from '@/lib/firebase';
import { ref as dbRef, set, push, update, get } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Users, Upload, Image as ImageIcon } from 'lucide-react';
import type { Contact } from '@/lib/types';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [groupPhotoPreview, setGroupPhotoPreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleMemberToggle = (number: string) => {
    setSelectedMembers(prev =>
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: 'Arquivo muito grande', description: 'Por favor, selecione uma imagem menor que 2MB.', variant: 'destructive' });
        return;
      }
      setGroupPhoto(file);
      setGroupPhotoPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const resetForm = () => {
    setGroupName('');
    setSelectedMembers([]);
    setGroupPhoto(null);
    setGroupPhotoPreview('');
    setIsCreating(false);
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !groupName.trim() || selectedMembers.length === 0) {
      toast({ title: 'Entrada Inválida', description: 'O nome do grupo e pelo menos um membro são necessários.', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    let photoURL = '';

    try {
      const newGroupRef = push(dbRef(db, 'groups'));
      const groupId = newGroupRef.key;
      if (!groupId) throw new Error("Could not generate group ID");

      if (groupPhoto) {
        const filePath = `group_avatars/${groupId}/${groupPhoto.name}`;
        const fileStorageRef = storageRef(storage, filePath);
        const uploadTask = await uploadBytesResumable(fileStorageRef, groupPhoto);
        photoURL = await getDownloadURL(uploadTask.ref);
      }

      const allMemberNumbers = [userProfile.number, ...selectedMembers];
      const membersObject = allMemberNumbers.reduce((acc, number) => {
        acc[number] = true;
        return acc;
      }, {} as { [key: string]: boolean });

      const newGroupData = {
        id: groupId,
        name: groupName.trim(),
        photoURL: photoURL,
        members: membersObject,
        createdBy: userProfile.uid,
      };

      await set(newGroupRef, newGroupData);

      const updates: { [key: string]: boolean } = {};
      const numberToUidLookups = await Promise.all(
        allMemberNumbers.map(async (number) => {
          const numberSnap = await get(dbRef(db, `numbers/${number}`));
          if (numberSnap.exists()) return { uid: numberSnap.val().uid };
          return null;
        })
      );
      
      numberToUidLookups.forEach(lookup => {
        if(lookup) updates[`/users/${lookup.uid}/groups/${groupId}`] = true;
      });

      if (Object.keys(updates).length > 0) {
        await update(dbRef(db), updates);
      }

      toast({ title: 'Sucesso!', description: `Grupo "${groupName.trim()}" criado.` });
      resetForm();
      onOpenChange(false);

    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Falha ao criar o grupo. Por favor, tente novamente.', variant: 'destructive' });
    } finally {
        setIsCreating(false);
    }
  };

  const contacts = userProfile?.contacts ? Object.entries(userProfile.contacts) : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if(!isCreating) onOpenChange(isOpen); }} >
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => { if (isCreating) e.preventDefault(); }}>
        <DialogHeader>
          <DialogTitle>Criar Novo Grupo</DialogTitle>
          <DialogDescription>
            Dê um nome e um ícone ao seu grupo e adicione membros.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateGroup}>
          <div className="space-y-4 py-4">
             <div className="flex items-center gap-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={groupPhotoPreview} data-ai-hint="group icon" />
                    <AvatarFallback><ImageIcon className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" onClick={triggerFileSelect} disabled={isCreating}>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Ícone
                </Button>
                <Input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
             </div>
            <div className="space-y-2">
              <Label htmlFor="group-name">Nome do Grupo</Label>
              <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Meu Grupo Incrível" required disabled={isCreating} />
            </div>
            <div className="space-y-2">
              <Label>Selecionar Membros</Label>
               {contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center border rounded-md">
                        Você não tem contatos para adicionar a um grupo.
                    </p>
                ) : (
                    <ScrollArea className="h-48 rounded-md border">
                        <div className="p-4 space-y-2">
                        {contacts.map(([number, contact]) => (
                            <div key={number} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`member-${number}`}
                                    checked={selectedMembers.includes(number)}
                                    onCheckedChange={() => handleMemberToggle(number)}
                                    disabled={isCreating}
                                />
                                <Label htmlFor={`member-${number}`} className="flex items-center gap-3 font-normal cursor-pointer">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={(contact as Contact).photoURL || undefined} />
                                        <AvatarFallback>{(contact as Contact).displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {(contact as Contact).displayName}
                                </Label>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isCreating}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}>
                {isCreating ? 'Criando...' : 'Criar Grupo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
