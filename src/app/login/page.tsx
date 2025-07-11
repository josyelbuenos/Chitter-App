"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquareDashed } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);


  const handleRegister = async () => {
    if (!username || !password) {
      toast({ title: 'Erro', description: 'Nome de usuário e senha são obrigatórios.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const dummyEmail = `${username.toLowerCase().trim()}@chitter.app`;

    try {
      await createUserWithEmailAndPassword(auth, dummyEmail, password);
      
      toast({ title: 'Bem-vindo(a)!', description: 'Conta criada com sucesso!' });
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: 'Erro de Cadastro', description: 'Este nome de usuário já está em uso. Por favor, faça login.', variant: 'destructive' });
      } else if (error.code === 'auth/weak-password') {
        toast({ title: 'Erro de Cadastro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro de Autenticação', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      toast({ title: 'Erro', description: 'Nome de usuário e senha são obrigatórios.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const dummyEmail = `${username.toLowerCase().trim()}@chitter.app`;

    try {
      await signInWithEmailAndPassword(auth, dummyEmail, password);
      toast({ title: 'Sucesso', description: 'Login efetuado com sucesso!' });
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast({ title: 'Erro de Login', description: 'Nome de usuário ou senha inválidos.', variant: 'destructive' });
      } else {
        toast({ title: 'Erro de Autenticação', description: error.message, variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const toggleMode = () => {
    if (isLoading) return;
    setMode(prev => prev === 'login' ? 'register' : 'login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4">
      <Card className="w-full max-w-sm shadow-2xl shadow-primary/20 animate-in fade-in-0 zoom-in-95 duration-500 cyber-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-full bg-primary/10 p-4 animate-float">
            <MessageSquareDashed className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">
            {mode === 'login' ? 'Bem-vindo(a) de Volta!' : 'Crie uma Conta'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Digite suas credenciais para conversar anonimamente.' : 'Escolha seu nome de usuário anônimo e senha.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Escolha um nome de usuário" disabled={isLoading} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite uma senha" disabled={isLoading} required/>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
            </Button>
            <Button type="button" variant="link" onClick={toggleMode} disabled={isLoading}>
              {mode === 'login' ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
