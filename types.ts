
export enum MessageStatus {
  PENDING = 'pending', // Waiting for internet
  SENT = 'sent',      // Reached "server"
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio'
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  type: MessageType;
  status: MessageStatus;
  mediaUrl?: string;
  fileName?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: string;
  online: boolean;
}

export const USER_A: User = {
  id: 'user_a',
  name: 'Alex Johnson',
  phone: '+1 (555) 010-2345',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  status: 'Hey there! I am using SyncChat.',
  online: true
};

export const USER_B: User = {
  id: 'user_b',
  name: 'Sarah Smith',
  phone: '+1 (555) 010-9876',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  status: 'Available',
  online: true
};
