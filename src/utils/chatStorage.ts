import { ChatSession, ChatMessage } from '../types';

const CHATS_PREFIX = 'noire_ai_chats_';

export function getStorageKey(userId: string): string {
  return `${CHATS_PREFIX}${userId || 'guest'}`;
}

export function loadUserChats(userId: string): ChatSession[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading chats', e);
  }

  // If no chats exist for this user, create an initial default chat
  const defaultChat: ChatSession = {
    id: `chat-${Date.now()}`,
    userId: userId || 'guest',
    title: 'Новый диалог',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveUserChats(userId, [defaultChat]);
  return [defaultChat];
}

export function saveUserChats(userId: string, chats: ChatSession[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(chats));
  } catch (e) {
    console.error('Error saving chats', e);
  }
}

export function createNewSession(userId: string, title: string = 'Новый диалог'): ChatSession {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: userId || 'guest',
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function deriveChatTitle(messageText: string, hasImages: boolean): string {
  if (messageText && messageText.trim().length > 0) {
    const clean = messageText.trim().replace(/\n+/g, ' ');
    if (clean.length > 35) {
      return clean.substring(0, 32) + '...';
    }
    return clean;
  }
  if (hasImages) {
    return 'Анализ фото из галереи';
  }
  return 'Новый диалог';
}
