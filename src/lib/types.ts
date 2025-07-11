export interface Contact {
  username: string;
  displayName: string;
  photoURL: string;
}

export interface GroupProfile {
  id: string;
  name: string;
  photoURL?: string;
  members: { [userNumber: string]: true };
  createdBy: string; // User UID of the creator
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName?: string;
  bio?: string;
  photoURL?: string;
  number: string;
  contacts?: { [number: string]: Contact };
  groups?: { [groupId: string]: true };
  unreadCounts?: { [chatId: string]: number };
  requests?: { [senderNumber: string]: true };
  blocked?: { [blockedNumber: string]: true };
}

export interface Message {
  sender: string; // user number
  timestamp: number;
  text?: string;
  mediaType: 'text' | 'image' | 'video' | 'audio' | 'deleted';
  mediaUrl?: string;
  fileName?: string;
  status?: 'sent' | 'seen';
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  };
}
