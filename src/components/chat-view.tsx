
'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { db, storage } from '@/lib/firebase';
import { ref, onValue, push, serverTimestamp, get, update, set, increment } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Mic, StopCircle, Check, CheckCheck, Users, MoreHorizontal, X, Reply, UserPlus } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { Message, UserProfile, GroupProfile } from '@/lib/types';
import { cn, getDirectChatId } from '@/lib/utils';
import { isSameDay, format, isToday, isYesterday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatViewProps {
  contactId: string; // Can be a contact's number OR group_groupId
}

type ClientMessage = Message & { id: string };

const MessageStatusIcon = ({ status }: { status?: 'sent' | 'seen' }) => {
    if (status === 'seen') {
        return <CheckCheck className="h-4 w-4 text-accent" />;
    }
    return <Check className="h-4 w-4" />;
};

const getMediaTypeTranslation = (type: Message['mediaType']) => {
    switch (type) {
        case 'image': return 'imagem';
        case 'video': return 'vídeo';
        case 'audio': return 'áudio';
        default: return 'arquivo';
    }
};

function ChatViewInternal({ contactId }: ChatViewProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  
  const isGroupChat = contactId.startsWith('group_');
  const chatId = isGroupChat ? contactId.substring(6) : null;
  const directChatContactNumber = isGroupChat ? null : contactId;
  
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSubject, setChatSubject] = useState<Partial<UserProfile> | Partial<GroupProfile> | null>(null);
  const [memberProfiles, setMemberProfiles] = useState<{[number: string]: Partial<UserProfile>}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ClientMessage | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');


  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const finalChatId = isGroupChat ? chatId : (userProfile && directChatContactNumber ? getDirectChatId(userProfile.number, directChatContactNumber) : null);
  
  const messageRefPath = finalChatId ? `chats/${finalChatId}` : null;

  useEffect(() => {
    if (!finalChatId) return;

    setIsLoading(true);
    let subjectUnsubscribe: () => void;

    const setupChat = async () => {
        try {
            if (isGroupChat && chatId) {
                const groupRef = ref(db, `groups/${chatId}`);
                subjectUnsubscribe = onValue(groupRef, async (snapshot) => {
                    if (snapshot.exists()) {
                        const groupData = snapshot.val() as GroupProfile;
                        setChatSubject(groupData);
                        const memberNumbers = Object.keys(groupData.members);
                        const profiles: {[number: string]: Partial<UserProfile>} = {};
                        for (const number of memberNumbers) {
                             const numberSnap = await get(ref(db, `numbers/${number}`));
                             if (numberSnap.exists()) {
                                const { uid } = numberSnap.val();
                                const userRef = ref(db, `users/${uid}`);
                                const userSnap = await get(userRef);
                                if (userSnap.exists()) {
                                    profiles[number] = { uid, ...userSnap.val() };
                                }
                             }
                        }
                        setMemberProfiles(profiles);
                    } else { setChatSubject(null); }
                    setIsLoading(false);
                });
            } else if (directChatContactNumber) {
                const numberRef = ref(db, `numbers/${directChatContactNumber}`);
                const numberSnapshot = await get(numberRef);
                if (numberSnapshot.exists()) {
                    const { uid } = numberSnapshot.val();
                    const userRef = ref(db, `users/${uid}`);
                    subjectUnsubscribe = onValue(userRef, (userSnapshot) => {
                        if (userSnapshot.exists()) { setChatSubject({ uid, ...userSnapshot.val() }); }
                        setIsLoading(false);
                    });
                } else {
                    setChatSubject({ username: directChatContactNumber, displayName: directChatContactNumber });
                    setIsLoading(false);
                }
            }
        } catch (error) {
            console.error("Error setting up chat:", error);
            setIsLoading(false);
        }
    };
    
    setupChat();

    return () => { if(subjectUnsubscribe) subjectUnsubscribe(); }
  }, [finalChatId, isGroupChat, chatId, directChatContactNumber]);
  
  // This effect fetches messages
  useEffect(() => {
    if (!messageRefPath || !userProfile) return;
    
    const messagesRef = ref(db, messageRefPath);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messageList: ClientMessage[] = data ? Object.entries(data).map(([id, msg]) => ({ ...(msg as Message), id })) : [];
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(messageList);
    }, (error) => {
        console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [messageRefPath, userProfile]);

  // This effect scrolls to the bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isGroupChat || !userProfile || !directChatContactNumber || messages.length === 0 || !finalChatId) return;

    const updates: { [key: string]: 'seen' } = {};
    messages.forEach(msg => {
        if (msg.sender === directChatContactNumber && msg.status !== 'seen') {
            updates[`/chats/${finalChatId}/${msg.id}/status`] = 'seen';
        }
    });

    if (Object.keys(updates).length > 0) {
        update(ref(db), updates).catch(error => console.error("Failed to update message status:", error));
    }
  }, [messages, userProfile, isGroupChat, directChatContactNumber, finalChatId]);
  
  useEffect(() => {
    if (!finalChatId || !userProfile?.uid) return;
    const unreadCountRef = ref(db, `users/${userProfile.uid}/unreadCounts/${finalChatId}`);
    set(unreadCountRef, 0);
  }, [finalChatId, userProfile?.uid]);

  const sendMessage = async (messagePayload: Partial<Omit<Message, 'sender' | 'timestamp' | 'status'>>) => {
    if (!userProfile || !finalChatId) return;

    // Check if sender is blocked by recipient
    if (directChatContactNumber) {
        const recipientNumberRef = ref(db, `numbers/${directChatContactNumber}`);
        const recipientNumberSnap = await get(recipientNumberRef);
        if (recipientNumberSnap.exists()) {
            const recipientUID = recipientNumberSnap.val().uid;
            const blockedRef = ref(db, `users/${recipientUID}/blocked/${userProfile.number}`);
            const blockedSnap = await get(blockedRef);
            if (blockedSnap.exists()) {
                toast({ title: 'Mensagem Não Enviada', description: 'Você foi bloqueado por este usuário.', variant: 'destructive' });
                return;
            }
        }
    }

    const messagesRef = ref(db, `chats/${finalChatId}`);
    const fullMessage: Partial<Message> = { ...messagePayload, sender: userProfile.number, timestamp: serverTimestamp(), status: 'sent' };

    if (replyingTo) {
      const replySenderProfile = replyingTo.sender === userProfile.number ? userProfile : (isGroupChat ? memberProfiles[replyingTo.sender] : chatSubject as UserProfile);
      const replySenderName = replySenderProfile?.displayName || replySenderProfile?.username || '...';
      const replyText = replyingTo.text || `um(a) ${getMediaTypeTranslation(replyingTo.mediaType)}`;
      fullMessage.replyTo = { messageId: replyingTo.id, senderName: replySenderName, text: replyText };
    }
    
    await push(messagesRef, fullMessage);
    setNewMessage('');
    setReplyingTo(null);
    
    const updates: { [key: string]: any } = {};

    // Ensure sender has the chat in their list for UI rendering
    const senderUnreadCountRef = `users/${userProfile.uid}/unreadCounts/${finalChatId}`;
    const senderUnreadSnap = await get(ref(db, senderUnreadCountRef));
    if (!senderUnreadSnap.exists()) {
        updates[senderUnreadCountRef] = 0;
    }

    const memberNumbers = isGroupChat ? Object.keys((chatSubject as GroupProfile)?.members || {}) : (userProfile && directChatContactNumber ? [userProfile.number, directChatContactNumber] : []);
    const otherMembers = memberNumbers.filter(num => num !== userProfile.number);

    for (const number of otherMembers) {
        const numberSnap = await get(ref(db, `numbers/${number}`));
        if (numberSnap.exists()) {
          const { uid } = numberSnap.val();
          updates[`users/${uid}/unreadCounts/${finalChatId}`] = increment(1);
        }
    }
    
    if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;
    await sendMessage({ text: newMessage.trim(), mediaType: 'text' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile || !finalChatId) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({ title: "Arquivo muito grande", description: "Por favor, selecione um arquivo menor que 10MB.", variant: "destructive" });
      return;
    }

    const mediaType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : null);
    if (!mediaType) {
      toast({ title: "Tipo de arquivo não suportado", description: "Por favor, selecione um arquivo de imagem ou vídeo.", variant: "destructive" });
      return;
    }

    setUploadProgress(0);
    const filePath = `chat_media/${finalChatId}/${Date.now()}_${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileStorageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      (error) => {
        console.error("File upload error:", error);
        toast({ title: "Falha no Upload", description: "Ocorreu um erro ao enviar seu arquivo.", variant: "destructive" });
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await sendMessage({ mediaType, mediaUrl: downloadURL, fileName: file.name });
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    );
  };

  const handleAudioClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const audioChunks: Blob[] = [];
        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          if (!userProfile || !finalChatId) return;

          setUploadProgress(0);
          try {
            const filePath = `chat_media/${finalChatId}/${Date.now()}_audio.webm`;
            const fileStorageRef = storageRef(storage, filePath);
            const uploadTask = uploadBytesResumable(fileStorageRef, audioBlob);
            uploadTask.on('state_changed',
              (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
              (error) => {
                console.error("Audio upload error:", error);
                toast({ title: "Falha no Upload", description: "Não foi possível enviar a mensagem de voz.", variant: "destructive" });
                setUploadProgress(null);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await sendMessage({ mediaType: 'audio', mediaUrl: downloadURL, fileName: 'Mensagem de voz' });
                setUploadProgress(null);
              }
            );
          } catch (error) {
             console.error("Audio upload error:", error);
             toast({ title: "Falha no Upload", description: "Não foi possível enviar a mensagem de voz.", variant: "destructive" });
             setUploadProgress(null);
          }
        };
        recorder.start(); setIsRecording(true);
      } catch (error) {
        console.error("Mic access error:", error);
        toast({ title: "Acesso ao Microfone Negado", description: "Por favor, permita o acesso ao microfone nas configurações do seu navegador.", variant: "destructive"});
      }
    }
  };

  const handleReply = (message: ClientMessage) => { if (message.mediaType !== 'deleted') setReplyingTo(message); };

  const handleDelete = async (messageId: string) => {
    if (!finalChatId) return;
    try {
      await update(ref(db, `chats/${finalChatId}/${messageId}`), {
        text: 'Esta mensagem foi apagada', mediaType: 'deleted', mediaUrl: null, fileName: null, replyTo: null,
      });
    } catch (error) { toast({ title: 'Erro', description: 'Falha ao apagar mensagem.', variant: 'destructive' }); }
  };

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !directChatContactNumber || !newContactName.trim() || !(chatSubject as UserProfile)?.username) {
        toast({title: "Erro", description: "Não foi possível adicionar o contato.", variant: "destructive"});
        return;
    }
    const contactRef = ref(db, `users/${userProfile.uid}/contacts/${directChatContactNumber}`);
    const newContactData = {
        username: (chatSubject as UserProfile)?.username,
        displayName: newContactName.trim(),
        photoURL: (chatSubject as UserProfile)?.photoURL || ''
    };
    await set(contactRef, newContactData);
    toast({ title: 'Contato Adicionado', description: `${newContactName.trim()} agora está em seus contatos.` });
    setIsAddContactOpen(false);
    setNewContactName('');
};
  
  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-accent/20', 'rounded-lg', 'transition-colors', 'duration-1000');
        setTimeout(() => {
          element.classList.remove('bg-accent/20', 'rounded-lg', 'transition-colors', 'duration-1000');
        }, 1500);
    }
  };
  
  if (!userProfile || !finalChatId) return null;

  const subjectName = (chatSubject as GroupProfile)?.name || (chatSubject as UserProfile)?.displayName || (chatSubject as UserProfile)?.username || '...';
  const subjectPhoto = (chatSubject as Partial<GroupProfile & UserProfile>)?.photoURL;
  const subjectFallback = subjectName.charAt(0).toUpperCase();

  let lastDate: number | null = null;
  
  const renderMessageContent = (msg: Message) => {
    if (msg.mediaType === 'deleted') return <p className="text-sm italic text-muted-foreground/80">{msg.text || 'Esta mensagem foi apagada'}</p>;
    switch (msg.mediaType) {
      case 'image': return <img src={msg.mediaUrl} alt={msg.fileName || 'Imagem'} className="rounded-md max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} data-ai-hint="user content" />;
      case 'video': return <video src={msg.mediaUrl} controls className="rounded-md max-w-full" />;
      case 'audio': return <audio src={msg.mediaUrl} controls className="w-full max-w-xs" />;
      case 'text': default: if (!msg.text) return null; return <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>;
    }
  };

  const formatDateSeparator = (timestamp: number) => {
    const date = new Date(timestamp);
    if (isToday(date)) return 'Hoje'; if (isYesterday(date)) return 'Ontem'; return format(date, 'MMMM d, yyyy');
  };
  
  const isContact = userProfile && directChatContactNumber ? !!userProfile.contacts?.[directChatContactNumber] : false;

  const chatHeader = (<>
      <Avatar className="h-10 w-10"><AvatarImage src={subjectPhoto || undefined} alt={subjectName} /><AvatarFallback className="text-xl">{isGroupChat ? <Users /> : subjectFallback}</AvatarFallback></Avatar>
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold font-headline leading-tight">{subjectName}</h2>
        {isGroupChat ? (<p className="text-xs text-muted-foreground">{Object.keys((chatSubject as GroupProfile)?.members || {}).length} membros</p>) : (<p className="text-xs text-muted-foreground font-mono">@{(chatSubject as UserProfile)?.username}</p>)}
      </div>
  </>);

  const regularFooter = (
    <div className="p-4 border-t bg-card rounded-b-xl">
      <form onSubmit={handleSendMessage} className="flex items-start gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,video/*" className="hidden" />
        <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploadProgress !== null || isRecording}><Paperclip className="w-5 h-5" /></Button>
        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={isRecording ? "Gravando áudio..." : "Digite uma mensagem..."} autoComplete="off" disabled={isLoading || uploadProgress !== null} />
        {newMessage.trim() ? (<Button type="submit" size="icon" disabled={isLoading}><Send className="h-4 w-4" /></Button>) : (<Button type="button" size="icon" onClick={handleAudioClick} disabled={uploadProgress !== null} variant={isRecording ? 'destructive' : 'default'}>{isRecording ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}</Button>)}
      </form>
    </div>
  );

  return (
    <Dialog>
      <div className="flex flex-col h-full bg-background rounded-xl cyber-card">
        <header className="flex items-center gap-3 p-3 border-b bg-background/80 backdrop-blur-sm shadow-sm rounded-t-xl shrink-0 sticky top-0 z-10">
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
            <DialogTrigger asChild>
                <div className="flex-1 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors flex items-center gap-4">
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                  ) : chatHeader}
                </div>
            </DialogTrigger>
        </header>
        <div className="flex-1 relative">
            <ScrollArea className="absolute inset-0" viewportRef={viewportRef}>
              <div className="p-4 space-y-2">
                {messages.map((msg) => {
                    const isUser = msg.sender === userProfile.number;
                    const senderProfile = isUser ? userProfile : (isGroupChat ? memberProfiles[msg.sender] : chatSubject as UserProfile);
                    const senderDisplayName = senderProfile?.displayName || senderProfile?.username || '...';
                    const showDateSeparator = lastDate === null || !isSameDay(new Date(msg.timestamp), new Date(lastDate));
                    if (msg.timestamp) lastDate = msg.timestamp;

                    return (
                        <React.Fragment key={msg.id}>
                            {showDateSeparator && msg.timestamp && (<div className="flex items-center justify-center my-4"><div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{formatDateSeparator(msg.timestamp)}</div></div>)}
                            <div className={cn('group flex items-end gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300', isUser ? 'justify-end' : 'justify-start')}>
                                {!isUser && (<Avatar className="h-8 w-8"><AvatarImage src={senderProfile?.photoURL || undefined} alt={senderDisplayName} /><AvatarFallback>{senderDisplayName.charAt(0).toUpperCase()}</AvatarFallback></Avatar>)}
                                {isUser && msg.mediaType !== 'deleted' && (<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleReply(msg)}><Reply className="mr-2 h-4 w-4" />Responder</DropdownMenuItem><DropdownMenuItem className="!text-destructive" onClick={() => handleDelete(msg.id)}>Apagar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>)}
                                <div id={`message-${msg.id}`} className={cn('max-w-xs md:max-w-md lg:max-w-xl rounded-xl px-4 py-2 shadow-md flex flex-col', isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                                    {!isUser && isGroupChat && <div className="text-xs font-bold mb-1 text-accent">{senderDisplayName}</div>}
                                    {msg.replyTo && msg.mediaType !== 'deleted' && (<a href={`#message-${msg.replyTo.messageId}`} onClick={(e) => { e.preventDefault(); scrollToMessage(msg.replyTo.messageId); }} className="mb-2 p-2 rounded-md bg-black/20 border-l-2 border-accent/50 block hover:bg-black/30 transition-colors"><p className="text-xs font-bold">{msg.replyTo.senderName}</p><p className="text-sm opacity-80 truncate">{msg.replyTo.text}</p></a>)}
                                    {renderMessageContent(msg)}
                                    <div className="flex items-center self-end gap-2 text-xs mt-1 opacity-70">
                                        <span>{msg.timestamp ? format(new Date(msg.timestamp), 'p') : ''}</span>
                                        {isUser && !isGroupChat && <MessageStatusIcon status={msg.status} />}
                                        {isUser && isGroupChat && <MessageStatusIcon status={'sent'} />}
                                    </div>
                                </div>
                                {!isUser && msg.mediaType !== 'deleted' && (<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="start"><DropdownMenuItem onClick={() => handleReply(msg)}><Reply className="mr-2 h-4 w-4" />Responder</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>)}
                                {isUser && (<Avatar className="h-8 w-8"><AvatarImage src={userProfile?.photoURL || undefined} alt={userProfile.displayName} /><AvatarFallback>{(userProfile.displayName || userProfile.username).charAt(0).toUpperCase()}</AvatarFallback></Avatar>)}
                            </div>
                        </React.Fragment>
                    )
                })}
                 {uploadProgress !== null && (<div className="flex justify-end"><div className="w-64 space-y-2 rounded-lg bg-primary/80 text-primary-foreground p-3"><p className="text-sm font-medium">Enviando...</p><div className="flex items-center gap-2"><Progress value={uploadProgress} className="w-full bg-primary-foreground/30" /><span className="text-xs font-mono">{`${uploadProgress}%`}</span></div></div></div>)}
              </div>
            </ScrollArea>
        </div>
        <footer className="shrink-0">
          {replyingTo && (<div className="p-3 border-t bg-card/80 flex justify-between items-center"><div className="overflow-hidden"><p className="text-xs font-bold text-accent">Respondendo a {replyingTo.sender === userProfile.number ? 'você' : (memberProfiles[replyingTo.sender]?.displayName || (chatSubject as UserProfile)?.displayName || '...')}</p><p className="text-sm text-muted-foreground truncate">{replyingTo.text || `um(a) ${getMediaTypeTranslation(replyingTo.mediaType)}`}</p></div><Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)}><X className="h-4 w-4" /></Button></div>)}
          {regularFooter}
        </footer>
      </div>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-2"><AvatarImage src={subjectPhoto || undefined} alt={subjectName} /><AvatarFallback className="text-4xl">{isGroupChat ? <Users /> : subjectFallback}</AvatarFallback></Avatar>
            <DialogTitle className="font-headline text-2xl">{subjectName}</DialogTitle>
            <DialogDescription>{isGroupChat ? <>{Object.keys((chatSubject as GroupProfile)?.members || {}).length} membros</> : <span className="font-mono">@{(chatSubject as UserProfile)?.username}</span>}</DialogDescription>
        </DialogHeader>
        {isGroupChat ? (<div className="p-4 bg-muted/50 rounded-lg my-4"><h3 className="font-semibold text-sm text-foreground mb-2 font-headline">Membros</h3><ScrollArea className="h-48"><div className="space-y-3 pr-4">{Object.values(memberProfiles).map(member => (<div key={member.uid} className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={member.photoURL || undefined} alt={member.displayName} /><AvatarFallback>{member.displayName?.charAt(0).toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{member.displayName}</span></div>))}</div></ScrollArea></div>) : (<div className="p-4 bg-muted/50 rounded-lg my-4"><h3 className="font-semibold text-sm text-foreground mb-2 font-headline">Bio</h3><p className="text-sm text-muted-foreground">{(chatSubject as UserProfile)?.bio || "Este usuário ainda não escreveu uma bio."}</p></div>)}
        {!isGroupChat && !isContact && (
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline"><UserPlus className="mr-2 h-4 w-4" /> Adicionar aos Contatos</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Contato</DialogTitle>
                        <DialogDescription>
                            Dê um nome a este contato para identificá-lo facilmente.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddContactSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="contact-name" className="text-right">Nome</Label>
                                <Input id="contact-name" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="col-span-3" placeholder="Digite um nome" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                            <Button type="submit">Salvar Contato</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        )}
        <DialogClose asChild><Button type="button" variant="secondary">Fechar</Button></DialogClose>
      </DialogContent>
    </Dialog>
  );
}

// Wrap the main component in Suspense to handle the `useSearchParams` hook correctly.
export default function ChatView(props: ChatViewProps) {
  return (
    <Suspense fallback={<div>Carregando Chat...</div>}>
      <ChatViewInternal {...props} />
    </Suspense>
  );
}
