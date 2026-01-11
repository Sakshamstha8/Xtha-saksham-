
import { Message, User } from '../types';

const STORAGE_KEY = 'gemini_chat_messages';
const USERS_KEY = 'gemini_chat_users';

export const storageService = {
  getMessages: (): Message[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveMessages: (messages: Message[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  },

  addMessage: (message: Message) => {
    const messages = storageService.getMessages();
    messages.push(message);
    storageService.saveMessages(messages);
  },

  updateMessageStatus: (id: string, status: any) => {
    const messages = storageService.getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index !== -1) {
      messages[index].status = status;
      storageService.saveMessages(messages);
    }
  },

  getUsers: (defaultUsers: { [key: string]: User }): { [key: string]: User } => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : defaultUsers;
  },

  saveUser: (user: User) => {
    const current = storageService.getUsers({});
    current[user.id] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(current));
  }
};
