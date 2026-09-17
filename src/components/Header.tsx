import React, { useState } from 'react';
import {
  Sparkles,
  Trash2,
  HelpCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  Menu,
  Sun,
  Moon,
  User,
  Plus,
  Chrome,
  Music,
  Instagram,
} from 'lucide-react';
import { UserAccount, ThemeMode } from '../types';

interface HeaderProps {
  onClear: () => void;
  messageCount: number;
  onToggleSidebar: () => void;
  activeChatTitle: string;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
  onCreateNewChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onClear,
  messageCount,
  onToggleSidebar,
  activeChatTitle,
  theme,
  onToggleTheme,
  currentUser,
  onOpenAuth,
  onCreateNewChat,
}) => {
  const [showRulesModal, setShowRulesModal] = useState(false);
  const isDark = theme === 'dark';

  return (
    <>
      <header
        className={`sticky top-0 z-30 px-3 sm:px-6 py-2.5 transition-colors border-b backdrop-blur-md ${
          isDark
            ? 'bg-slate-950/90 border-slate-800 text-slate-100'
            : 'bg-white/90 border-slate-200 text-slate-900 shadow-2xs'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Sidebar toggle + App Name + Chat title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              id="toggle-sidebar-btn"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Открыть список чатов"
            >
              <Menu className="w-4 h-4" />
            </button>

            <button
              id="header-new-chat-btn"
              onClick={onCreateNewChat}
              className={`p-2 rounded-xl border transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-medium ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Создать новый чат"
            >
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Новый чат</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm tracking-tight hidden md:inline">
                Noire-AI
              </span>
              <span className="text-slate-400 hidden md:inline">•</span>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-[220px] md:max-w-xs text-sky-400">
                {activeChatTitle}
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle + Rules + Account + Clear */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggle Button */}
            <button
              id="header-theme-toggle"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title={isDark ? 'Переключить на белую тему' : 'Переключить на черную тему (Noire)'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-600" />
              )}
            </button>

            {/* Rules Modal Trigger */}
            <button
              id="header-rules-btn"
              onClick={() => setShowRulesModal(true)}
              className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
              title="Регламент обработки фото и запросов"
            >
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">Регламент</span>
            </button>

            {/* Account Profile / Login Button */}
            <button
              id="header-account-btn"
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-colors text-xs font-medium cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-md object-cover"
                  />
                ) : (
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold ${
                      currentUser.avatarColor || 'bg-indigo-600'
                    }`}
                  >
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                {currentUser.provider === 'google' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <Chrome className="w-1.5 h-1.5 text-red-500" />
                  </span>
                )}
                {currentUser.provider === 'tiktok' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-black flex items-center justify-center shadow-xs">
                    <Music className="w-1.5 h-1.5 text-cyan-400" />
                  </span>
                )}
                {currentUser.provider === 'instagram' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-xs">
                    <Instagram className="w-1.5 h-1.5 text-white" />
                  </span>
                )}
              </div>
              <span className="hidden sm:inline truncate max-w-[80px]">
                {currentUser.name}
              </span>
            </button>

            {/* Clear Chat Button */}
            {messageCount > 0 && (
              <button
                id="header-clear-btn"
                onClick={onClear}
                className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/40'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200'
                }`}
                title="Очистить сообщения в этом чате"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Rules Modal */}
      {showRulesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className={`border rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 font-semibold text-lg">
                <ShieldCheck className="w-5 h-5 text-sky-500" />
                Регламент Noire-AI помощника
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-sky-400">
                  <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  1. Работа с изображениями из галереи
                </h3>
                <ul className={`list-disc pl-5 space-y-1 text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li><strong>Задачи/уравнения:</strong> распознавание текста/формул, пошаговое математическое решение и финальный ответ.</li>
                  <li><strong>Поломки/бытовые приборы:</strong> определение устройства, причины дефекта и инструкция по починке.</li>
                  <li><strong>Скриншоты ошибок:</strong> анализ лога или ошибки ОС/кода и конкретный способ исправления.</li>
                  <li><strong>Документы/текст:</strong> выжимка сути, выявление рисков и ответы по пунктам.</li>
                  <li><strong>Низкое качество снимка:</strong> вежливая просьба переснять или уточнить фрагмент.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  2. Формат и стиль ответов
                </h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Сразу к сути без пустых предисловий. Списки, жирный шрифт для акцентов, короткие абзацы и четкие блоки: «Шаг 1», «Шаг 2», «Результат».
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1.5 flex items-center gap-1.5 text-indigo-400">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  3. Трехчастная структура решения
                </h3>
                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${isDark ? 'bg-slate-850 border-slate-700/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="font-medium text-sky-400">• Суть проблемы / Главный ответ (1–2 предложения)</div>
                  <div className="font-medium text-indigo-400">• Пошаговое решение / Объяснение</div>
                  <div className="font-medium text-emerald-400">• Итоговый вывод или рекомендация по следующим шагам</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
