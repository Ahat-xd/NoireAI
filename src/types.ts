export type ThemeMode = 'dark' | 'light';

export type AuthProvider = 'local' | 'google' | 'tiktok' | 'instagram';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  avatarColor?: string;
  avatarUrl?: string;
  provider?: AuthProvider;
  createdAt: string;
}

export interface UploadedImage {
  id: string;
  data: string; // base64 payload without data:...;base64,
  mimeType: string;
  previewUrl: string; // data URL for preview in UI
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  images?: UploadedImage[];
  timestamp: string;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
}

export interface ChatSession {
  id: string;
  userId: string; // ID of the user owning this chat, or 'guest'
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickSample {
  id: string;
  category: 'math' | 'repair' | 'error' | 'document';
  title: string;
  badge: string;
  description: string;
  prompt: string;
  svgIcon: string;
  sampleImageUrl?: string;
  sampleImageName?: string;
  sampleMimeType?: string;
}
