'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, loading } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || userProfile.username || '');
      setBio(userProfile.bio || '');
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'Arquivo muito grande',
          description: 'Por favor, selecione uma imagem menor que 2MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSaving(true);
    const userRef = ref(db, `users/${userProfile.uid}`);
    try {
      await update(userRef, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: photoURL,
      });
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar o perfil.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading || !userProfile) {
    return (
        <div className="p-4 md:p-8">
            <Card className="max-w-2xl mx-auto cyber-card">
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Card className="max-w-2xl mx-auto animate-in fade-in-0 zoom-in-95 duration-500 cyber-card">
        <CardHeader>
          <CardTitle className="font-headline">Editar Perfil</CardTitle>
          <CardDescription>Atualize as informações do seu perfil público.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSave}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={photoURL || undefined} alt={displayName} data-ai-hint="profile picture" />
                    <AvatarFallback>{(displayName || userProfile.username).charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" onClick={triggerFileSelect} disabled={isSaving}>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Foto
                  </Button>
                  <Input 
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handlePhotoChange}
                  />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de Exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nome de Usuário (Login)</Label>
              <Input value={userProfile.username} disabled />
               <p className="text-xs text-muted-foreground">Seu nome de usuário para login não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Conte-nos um pouco sobre você"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
