import React, { useRef, useState, useEffect } from 'react';
import { Send, Image as ImageIcon, Camera, X, Square } from 'lucide-react';
import { UploadedImage, ThemeMode } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, images: UploadedImage[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  attachedImages: UploadedImage[];
  setAttachedImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onOpenImageModal: (image: UploadedImage) => void;
  theme: ThemeMode;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  attachedImages,
  setAttachedImages,
  onOpenImageModal,
  theme,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollH, 180)}px`;
    }
  }, [inputText]);

  // Handle image files to UploadedImage
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAttachedImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Clipboard paste listener for images
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      processFiles(imageFiles);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isStreaming) return;
    const trimmed = inputText.trim();
    if (!trimmed && attachedImages.length === 0) return;

    onSendMessage(trimmed, attachedImages);
    setInputText('');
    setAttachedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const canSend = (inputText.trim().length > 0 || attachedImages.length > 0) && !isStreaming;

  return (
    <div
      className={`sticky bottom-0 pt-2.5 pb-4 px-3 sm:px-6 z-20 transition-colors ${
        isDark
          ? 'bg-gradient-to-t from-slate-950 via-slate-950 to-slate-950/90'
          : 'bg-gradient-to-t from-slate-100 via-slate-100 to-slate-100/90'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Quick Suggestion Chips Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-1 text-xs">
          <button
            id="chip-help"
            type="button"
            onClick={() => {
              setInputText('Чем могу помочь? Расскажи о своих главных возможностях.');
              textareaRef.current?.focus();
            }}
            className={`shrink-0 px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-sky-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-600 shadow-2xs'
            }`}
          >
            <span>💡</span>
            <span>Чем могу помочь?</span>
          </button>

          <button
            id="chip-homework"
            type="button"
            onClick={() => {
              setInputText('Помоги с домашкой: объясни решение по шагам и проверь ответ.');
              textareaRef.current?.focus();
            }}
            className={`shrink-0 px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-600 shadow-2xs'
            }`}
          >
            <span>📚</span>
            <span>Помочь с домашкой?</span>
          </button>

          <button
            id="chip-math"
            type="button"
            onClick={() => {
              setInputText('Помоги решить задачу по прикрепленному фото или уравнению: распиши по шагам.');
              textareaRef.current?.focus();
            }}
            className={`shrink-0 px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-600 shadow-2xs'
            }`}
          >
            <span>📐</span>
            <span>Решить по фото</span>
          </button>

          <button
            id="chip-error"
            type="button"
            onClick={() => {
              setInputText('Объясни ошибку на скриншоте и подскажи пошаговый способ решения.');
              textareaRef.current?.focus();
            }}
            className={`shrink-0 px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-300'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 shadow-2xs'
            }`}
          >
            <span>💻</span>
            <span>Найти ошибку</span>
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          id="hidden-file-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          id="hidden-camera-input"
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Input Wrapper Container */}
        <div
          className={`border rounded-2xl shadow-xl transition-all p-3 ${
            isDark
              ? 'bg-slate-900 border-slate-700/80 focus-within:border-sky-500'
              : 'bg-white border-slate-300 focus-within:border-sky-500 focus-within:shadow-md'
          }`}
        >
          {/* Attached Images Preview Row */}
          {attachedImages.length > 0 && (
            <div className={`flex flex-wrap gap-2.5 mb-2.5 pb-2.5 border-b ${isDark ? 'border-slate-800' : 'border-slate-150'}`}>
              {attachedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800 h-16 w-20 cursor-pointer shadow-xs"
                  onClick={() => onOpenImageModal(img)}
                  title="Нажмите для увеличения"
                >
                  <img
                    src={img.previewUrl}
                    alt={img.name || 'Прикрепленное фото'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => handleRemoveImage(img.id, e)}
                    className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/80 hover:bg-red-600 text-white transition-colors cursor-pointer"
                    title="Удалить фото"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[9px] text-slate-200 px-1 truncate">
                    {img.name || 'Фото'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Area */}
          <textarea
            id="chat-textarea"
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              attachedImages.length > 0
                ? 'Добавьте вопрос к фото (или нажмите "Отправить")...'
                : 'Опишите задачу или прикрепите фото/скриншот из галереи...'
            }
            rows={1}
            className={`w-full bg-transparent text-sm sm:text-base outline-none resize-none max-h-44 py-1 px-1 leading-relaxed ${
              isDark
                ? 'text-slate-100 placeholder-slate-500'
                : 'text-slate-900 placeholder-slate-400'
            }`}
          />

          {/* Controls Bottom Row */}
          <div className={`flex items-center justify-between gap-2 pt-2 mt-1 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
            {/* Attachment Actions */}
            <div className="flex items-center gap-1.5">
              <button
                id="upload-gallery-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="Загрузить фото или скриншот из галереи"
              >
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="hidden sm:inline">Галерея / Скриншот</span>
              </button>

              <button
                id="camera-capture-btn"
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isDark
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}
                title="Снимок с камеры"
              >
                <Camera className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">Камера</span>
              </button>

              <span className={`text-[11px] hidden md:inline ml-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Вставка из буфера (Ctrl+V)
              </span>
            </div>

            {/* Send / Stop Controls */}
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  id="stop-generation-btn"
                  type="button"
                  onClick={onStopStreaming}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Остановить</span>
                </button>
              ) : (
                <button
                  id="send-message-btn"
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    canSend
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/20 active:scale-95'
                      : isDark
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <span>Отправить</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footnote */}
        <p className={`text-center text-[11px] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Noire-AI: <strong>Суть проблемы → Пошаговое решение → Итоговый вывод</strong>. Сохранение чатов в аккаунте.
        </p>
      </div>
    </div>
  );
};
