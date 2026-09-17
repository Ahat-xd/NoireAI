import React from 'react';
import {
  Calculator,
  Wrench,
  Terminal,
  FileText,
  Image as ImageIcon,
  Sparkles,
  UploadCloud,
  MessageCircle,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { QUICK_SAMPLES, generateSampleCanvasImage } from '../data/samples';
import { UploadedImage, ThemeMode } from '../types';

interface EmptyStateProps {
  onSelectSample: (prompt: string, image?: UploadedImage) => void;
  onDropFiles: (files: FileList) => void;
  theme: ThemeMode;
}

export const KEY_PROMPTS = [
  {
    id: 'how-can-i-help',
    label: 'Чем могу помочь?',
    prompt: 'Чем ты можешь мне помочь? Расскажи о своих главных возможностях.',
    desc: 'Узнать все навыки и форматы решения задач',
    icon: 'MessageCircle',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  {
    id: 'homework-help',
    label: 'Помочь с домашкой?',
    prompt: 'Помоги с домашкой: объясни сложный материал, распиши пошаговое решение с формулами и проверь правильность.',
    desc: 'Математика, физика, языки, конспекты',
    icon: 'BookOpen',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'math-task',
    label: 'Решить задачу по фото',
    prompt: 'Помоги решить эту задачу или уравнение: распознай текст, распиши решение по шагам и дай итоговый ответ.',
    desc: 'Формулы, графики, уравнения и геометрия',
    icon: 'Calculator',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'code-error',
    label: 'Объяснить ошибку на скриншоте',
    prompt: 'Помоги разобраться с ошибкой на экране: определи причину сбоя и предложи конкретную пошаговую инструкцию по исправлению.',
    desc: 'Баги в коде, логи, ошибки ОС и приложений',
    icon: 'Terminal',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSample, onDropFiles, theme }) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const isDark = theme === 'dark';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-amber-500" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-emerald-500" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-sky-500" />;
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4 text-sky-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-sky-500" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  const handlePickSample = (sampleId: string) => {
    const sample = QUICK_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;

    const sampleImgData = generateSampleCanvasImage(sample.category);
    const uploadedImage: UploadedImage = {
      id: `sample-${Date.now()}`,
      data: sampleImgData.data,
      mimeType: sampleImgData.mimeType,
      previewUrl: sampleImgData.previewUrl,
      name: sampleImgData.name,
      size: 45000,
    };

    onSelectSample(sample.prompt, uploadedImage);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 flex flex-col items-center text-center">
      {/* Hero Icon */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-3.5 ring-4 ring-sky-500/10">
        <Sparkles className="w-8 h-8" />
      </div>

      {/* Greeting Header */}
      <h2 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        Привет, как дела?
      </h2>
      <p className="text-base sm:text-lg font-semibold bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
        Чем могу помочь?
      </p>
      <p className={`text-xs sm:text-sm max-w-lg mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Noire-AI — мультимодальный консультант: загрузите фото из галереи или выберите ключевое действие ниже.
      </p>

      {/* Key Prompt Suggestion Cards (Чем могу помочь?, Помочь с домашкой?, etc.) */}
      <div className="w-full max-w-2xl mb-6 text-left">
        <div className="flex items-center justify-between mb-2.5">
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Ключевые предложения для быстрого старта
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {KEY_PROMPTS.map((item) => (
            <button
              key={item.id}
              id={`quick-prompt-${item.id}`}
              type="button"
              onClick={() => onSelectSample(item.prompt)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-2xs ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-sky-500/40 hover:shadow-sky-500/5'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.color}`}>
                  {getIcon(item.icon)}
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-semibold transition-colors group-hover:text-sky-400 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {item.label}
                  </h4>
                  <p className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Hero Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-2xl p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer mb-7 flex flex-col items-center justify-center gap-2.5 ${
          isDragOver
            ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
            : isDark
            ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900'
            : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 shadow-xs'
        }`}
        onClick={() => {
          document.getElementById('hidden-file-input')?.click();
        }}
      >
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-sky-400 border border-slate-700' : 'bg-sky-50 text-sky-600 border border-sky-100'}`}>
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Перетащите фото или скриншот из галереи
          </p>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Поддерживаются JPG, PNG, WEBP, а также вставка из буфера (Ctrl+V)
          </p>
        </div>
      </div>

      {/* 4 Core Scenarios Grid */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Готовые сценарии с примерами фото
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_SAMPLES.map((sample) => (
            <div
              key={sample.id}
              id={`sample-card-${sample.id}`}
              onClick={() => handlePickSample(sample.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                isDark
                  ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-sky-500/40'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    {getIcon(sample.svgIcon)}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {sample.badge}
                  </span>
                </div>
                <h4 className={`text-xs sm:text-sm font-semibold transition-colors group-hover:text-sky-400 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {sample.title}
                </h4>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between text-[11px] text-sky-500 font-medium">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Тест с образцом фото
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
