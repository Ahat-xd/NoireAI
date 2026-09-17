import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MessageItem } from './components/MessageItem';
import { ChatInput } from './components/ChatInput';
import { EmptyState } from './components/EmptyState';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { AuthModal } from './components/AuthModal';
import { ChatMessage, ChatSession, UploadedImage, UserAccount, ThemeMode } from './types';
import { getCurrentUser, logoutUser } from './utils/auth';
import {
  loadUserChats,
  saveUserChats,
  createNewSession,
  deriveChatTitle,
} from './utils/chatStorage';
import { getSavedTheme, applyTheme } from './utils/theme';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => getSavedTheme());

  // User auth state
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Chat sessions state
  const [chats, setChats] = useState<ChatSession[]>(() => loadUserChats(currentUser.id));
  const [activeChatId, setActiveChatId] = useState<string>(() => {
    const loaded = loadUserChats(currentUser.id);
    return loaded[0]?.id || 'default';
  });

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active message & image inputs
  const [attachedImages, setAttachedImages] = useState<UploadedImage[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<UploadedImage | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [dragOverlay, setDragOverlay] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Apply theme on mount and when changed
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Find active chat
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  // Save chats whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      saveUserChats(currentUser.id, chats);
    }
  }, [chats, currentUser.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Full-window drag & drop handling for quick photo upload
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setDragOverlay(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setDragOverlay(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setDragOverlay(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return;
        const [meta, base64] = result.split(',');
        const mimeType = meta.split(':')[1]?.split(';')[0] || file.type || 'image/jpeg';

        const newImage: UploadedImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          data: base64,
          mimeType,
          previewUrl: result,
          name: file.name,
          size: file.size,
        };

        setAttachedImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Chat management
  const handleCreateNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
    const newChat = createNewSession(currentUser.id, 'Новый диалог');
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (idToDelete: string) => {
    if (isStreaming && activeChatId === idToDelete && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }

    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== idToDelete);
      if (filtered.length === 0) {
        const fresh = createNewSession(currentUser.id, 'Новый диалог');
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (activeChatId === idToDelete) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleRenameChat = (idToRename: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === idToRename ? { ...c, title: newTitle } : c))
    );
  };

  const handleClearCurrentChat = () => {
    if (window.confirm('Очистить все сообщения в текущем чате?')) {
      if (isStreaming && abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsStreaming(false);
      }
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages: [], title: 'Новый диалог' } : c
        )
      );
    }
  };

  // Auth management
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    const userChats = loadUserChats(user.id);
    setChats(userChats);
    setActiveChatId(userChats[0]?.id || 'default');
  };

  const handleLogout = () => {
    if (window.confirm('Выйти из аккаунта?')) {
      const guest = logoutUser();
      setCurrentUser(guest);
      const guestChats = loadUserChats(guest.id);
      setChats(guestChats);
      setActiveChatId(guestChats[0]?.id || 'default');
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleSendMessage = async (text: string, images: UploadedImage[]) => {
    if (isStreaming || !activeChat) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text,
      images: images.length > 0 ? [...images] : undefined,
      timestamp: new Date().toISOString(),
      status: 'complete',
    };

    const initialAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      text: '',
      timestamp: new Date().toISOString(),
      status: 'streaming',
    };

    // If active chat has default title and no previous messages, derive a smart title
    const shouldUpdateTitle =
      activeChat.messages.length === 0 || activeChat.title === 'Новый диалог';
    const updatedTitle = shouldUpdateTitle
      ? deriveChatTitle(text, images.length > 0)
      : activeChat.title;

    const currentChatId = activeChat.id;

    setChats((prev) =>
      prev.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, userMsg, initialAssistantMsg],
            }
          : c
      )
    );

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build history for context (exclude current user turn and assistant placeholder)
      const historyPayload = activeChat.messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
        images: m.images?.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
        })),
      }));

      const requestPayload = {
        message: text,
        images: images.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
        })),
        history: historyPayload,
      };

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Пустой ответ потока сервера.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const dataStr = trimmed.substring(6);
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              setChats((prev) =>
                prev.map((c) =>
                  c.id === currentChatId
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === assistantMessageId
                            ? { ...m, text: accumulatedText }
                            : m
                        ),
                      }
                    : c
                )
              );
            }
          } catch (e: any) {
            if (e.message && e.message !== 'Unexpected end of JSON input') {
              console.warn('SSE parsing note:', e);
            }
          }
        }
      }

      // Mark complete
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, status: 'complete' }
                    : m
                ),
              }
            : c
        )
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, status: 'complete' }
                      : m
                  ),
                }
              : c
          )
        );
      } else {
        console.error('Chat error:', err);
        const errorText = err?.message || 'Не удалось получить ответ. Попробуйте еще раз.';
        setChats((prev) =>
          prev.map((c) =>
            c.id === currentChatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId
                      ? { ...m, status: 'error', error: errorText }
                      : m
                  ),
                }
              : c
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleSelectSample = (prompt: string, sampleImage?: UploadedImage) => {
    const images = sampleImage ? [sampleImage] : [];
    handleSendMessage(prompt, images);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-white'
          : 'bg-slate-100 text-slate-900 selection:bg-sky-200 selection:text-slate-900'
      }`}
    >
      {/* Full-Screen Drag & Drop Overlay */}
      {dragOverlay && (
        <div className="fixed inset-0 z-50 bg-sky-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 border-4 border-dashed border-sky-400 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 mx-auto mb-4">
              <span className="text-3xl">📷</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Отпустите фото для анализа
            </h3>
            <p className="text-sm text-sky-200">
              Изображение будет прикреплено к запросу Noire-AI
            </p>
          </div>
        </div>
      )}

      {/* Sidebar for Multi-Chat & Accounts */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onCreateNewChat={handleCreateNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Chat View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <Header
          onClear={handleClearCurrentChat}
          messageCount={messages.length}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          activeChatTitle={activeChat?.title || 'Новый диалог'}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onCreateNewChat={handleCreateNewChat}
        />

        {/* Messages / Empty State */}
        <main
          className={`flex-1 flex flex-col justify-between overflow-y-auto ${
            isDark ? 'bg-slate-950' : 'bg-slate-100'
          }`}
        >
          {messages.length === 0 ? (
            <EmptyState
              onSelectSample={handleSelectSample}
              onDropFiles={processFiles}
              theme={theme}
            />
          ) : (
            <div className="flex-1 pb-4">
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onImageClick={(img) => setSelectedPreviewImage(img)}
                  theme={theme}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Bar */}
          <ChatInput
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            onStopStreaming={handleStopStreaming}
            attachedImages={attachedImages}
            setAttachedImages={setAttachedImages}
            onOpenImageModal={(img) => setSelectedPreviewImage(img)}
            theme={theme}
          />
        </main>
      </div>

      {/* Image Preview / Zoom Modal */}
      <ImagePreviewModal
        image={selectedPreviewImage}
        onClose={() => setSelectedPreviewImage(null)}
      />

      {/* Account Login / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        theme={theme}
      />
    </div>
  );
}
