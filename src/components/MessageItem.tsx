import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Volume2, VolumeX, AlertCircle, Bot, User, Maximize2 } from 'lucide-react';
import { ChatMessage, UploadedImage, ThemeMode } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  onImageClick: (image: UploadedImage) => void;
  theme: ThemeMode;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onImageClick, theme }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isDark = theme === 'dark';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.text
      .replace(/[*#`_~[\]()]/g, '')
      .replace(/```[\s\S]*?```/g, 'Код решения пропущен.');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasCyrillic = /[а-яА-ЯёЁ]/.test(message.text);
    utterance.lang = hasCyrillic ? 'ru-RU' : 'en-US';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isAssistant = message.role === 'assistant';

  return (
    <div
      id={`message-${message.id}`}
      className={`py-5 px-3 sm:px-6 transition-colors border-b ${
        isAssistant
          ? isDark
            ? 'bg-slate-900/60 border-slate-850'
            : 'bg-slate-50/80 border-slate-200/80'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                  : 'bg-white border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isAssistant ? 'Noire-AI Эксперт' : 'Вы'}
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Assistant Message Actions */}
            {isAssistant && message.text && (
              <div className="flex items-center gap-1">
                <button
                  id={`speak-msg-${message.id}`}
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSpeaking
                      ? 'bg-sky-500/20 text-sky-400'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title={isSpeaking ? 'Остановить чтение' : 'Озвучить ответ'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  id={`copy-msg-${message.id}`}
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Копировать ответ"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* User Attached Images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-1 pb-1">
              {message.images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onImageClick(img)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-transform hover:scale-[1.02] shadow-sm ${
                    isDark ? 'border-slate-750 bg-slate-800' : 'border-slate-300 bg-slate-100'
                  }`}
                >
                  <img
                    src={img.previewUrl}
                    alt={img.name || 'Прикрепленное фото'}
                    className="w-32 h-24 sm:w-44 sm:h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  {img.name && (
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 text-[10px] text-slate-200 px-2 py-0.5 truncate">
                      {img.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Text / Solution */}
          {message.text ? (
            <div className={`text-sm leading-relaxed space-y-3 break-words ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <Markdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h2 className={`text-base font-bold mt-3 mb-1.5 border-b pb-1 ${isDark ? 'text-sky-300 border-slate-800' : 'text-sky-700 border-slate-200'}`}>
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className={`text-sm font-bold mt-3 mb-1 flex items-center gap-1.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className={`text-sm font-semibold mt-2 mb-1 ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className={`mb-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className={`list-disc pl-5 space-y-1 mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className={`list-decimal pl-5 space-y-1 mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className={`text-sm font-normal ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {children}
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      className={`border-l-3 border-sky-500 pl-3 py-1.5 my-2 rounded-r-lg text-xs italic ${
                        isDark ? 'bg-sky-950/20 text-slate-300' : 'bg-sky-50 text-slate-700'
                      }`}
                    >
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className && typeof children === 'string' && !children.includes('\n');
                    if (isInline) {
                      return (
                        <code
                          className={`px-1.5 py-0.5 rounded-md font-mono text-xs border ${
                            isDark
                              ? 'bg-slate-800 text-sky-300 border-slate-700/60'
                              : 'bg-slate-100 text-sky-800 border-slate-200'
                          }`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <div className="relative my-2.5 rounded-xl bg-slate-950 border border-slate-800 p-3 overflow-x-auto text-xs font-mono text-slate-200 shadow-inner">
                        <code {...props}>{children}</code>
                      </div>
                    );
                  },
                }}
              >
                {message.text}
              </Markdown>
            </div>
          ) : message.status === 'streaming' ? (
            <div className="flex items-center gap-2 text-xs text-sky-500 font-medium py-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
              <span>Noire-AI анализирует данные и формирует решение...</span>
            </div>
          ) : null}

          {/* Error message */}
          {message.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
