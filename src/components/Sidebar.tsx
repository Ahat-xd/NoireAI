import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sun,
  Moon,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  Chrome,
  Music,
  Instagram,
} from 'lucide-react';
import { ChatSession, UserAccount, ThemeMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSession[];
  activeChatId: string;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onCreateNewChat,
  onDeleteChat,
  onRenameChat,
  currentUser,
  onOpenAuth,
  onLogout,
  theme,
  onToggleTheme,
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (chat: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chats.length <= 1) {
      if (window.confirm('Очистить этот чат?')) {
        onDeleteChat(id);
      }
      return;
    }
    if (window.confirm('Удалить этот чат?')) {
      onDeleteChat(id);
    }
  };

  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 flex flex-col transition-all duration-300 border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isDark
            ? 'bg-slate-950 border-slate-800/80 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">Noire-AI</span>
              <span className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Мультимодальный чат
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg lg:hidden transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="new-chat-btn"
            onClick={() => {
              onCreateNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className={`w-full py-2.5 px-3.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-sky-500/50 hover:shadow-sky-500/10'
                : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Новый чат</span>
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 py-1 flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Сохраненные диалоги ({chats.length})
            </span>
          </div>

          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isEditing = editingChatId === chat.id;

            return (
              <div
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => {
                  if (!isEditing) {
                    onSelectChat(chat.id);
                    if (window.innerWidth < 1024) onClose();
                  }
                }}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-slate-900 text-white border border-sky-500/40 shadow-xs'
                      : 'bg-white text-sky-950 border border-sky-300 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-sky-400' : isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />

                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(chat.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1"
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className={`w-full px-2 py-0.5 rounded-md text-xs outline-none border ${
                          isDark
                            ? 'bg-slate-800 border-sky-500 text-white'
                            : 'bg-slate-50 border-sky-500 text-slate-900'
                        }`}
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingChatId(null)}
                        className="p-1 text-slate-400 hover:text-slate-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="truncate block">{chat.title}</span>
                  )}
                </div>

                {/* Actions on hover/active */}
                {!isEditing && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartRename(chat, e)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isDark ? 'hover:text-slate-200 hover:bg-slate-800' : 'hover:text-slate-800 hover:bg-slate-200'
                      }`}
                      title="Переименовать"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(chat.id, e)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        isDark ? 'hover:text-red-400 hover:bg-slate-800' : 'hover:text-red-600 hover:bg-slate-200'
                      }`}
                      title="Удалить чат"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Theme & User Profile Footer */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'} space-y-2`}>
          {/* Theme Switcher Toggle */}
          <button
            id="theme-toggle-sidebar-btn"
            onClick={onToggleTheme}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>Тема: {isDark ? 'Черная (Noire)' : 'Белая (Светлая)'}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
              Сменить
            </span>
          </button>

          {/* User Account Tile */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
            }`}
          >
            <div
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
              onClick={onOpenAuth}
            >
              <div className="relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-xl object-cover shadow-xs border border-slate-700/50"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs ${
                      currentUser.avatarColor || 'bg-indigo-600'
                    }`}
                  >
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                {currentUser.provider === 'google' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-xs border border-slate-200">
                    <Chrome className="w-2.5 h-2.5 text-red-500" />
                  </span>
                )}
                {currentUser.provider === 'tiktok' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-black flex items-center justify-center shadow-xs border border-slate-800">
                    <Music className="w-2 h-2 text-cyan-400" />
                  </span>
                )}
                {currentUser.provider === 'instagram' && (
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-xs">
                    <Instagram className="w-2 h-2 text-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold block truncate">
                    {currentUser.name}
                  </span>
                  {currentUser.provider && currentUser.provider !== 'local' && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-medium ${
                      currentUser.provider === 'google'
                        ? 'bg-red-500/15 text-red-400'
                        : currentUser.provider === 'tiktok'
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : 'bg-pink-500/15 text-pink-400'
                    }`}>
                      {currentUser.provider}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {currentUser.id === 'guest' ? 'Нажмите для входа' : currentUser.email}
                </span>
              </div>
            </div>

            {currentUser.id === 'guest' ? (
              <button
                id="open-auth-sidebar-btn"
                onClick={onOpenAuth}
                className="p-1.5 rounded-lg text-sky-400 hover:bg-sky-500/10 transition-colors text-xs font-medium cursor-pointer"
                title="Войти"
              >
                Войти
              </button>
            ) : (
              <button
                id="logout-sidebar-btn"
                onClick={onLogout}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                }`}
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
