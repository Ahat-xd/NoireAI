import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Sparkles,
  Instagram,
  Chrome,
  Music,
  Loader2,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Key,
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  loginWithOAuthProvider,
  demoSocialLogin,
  GUEST_USER,
} from '../utils/auth';
import { UserAccount, ThemeMode } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  theme: ThemeMode;
}

interface UnconfiguredGuide {
  provider: 'google' | 'tiktok' | 'instagram';
  providerName: string;
  requiredEnvVars: string[];
  redirectUri: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  theme,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<'google' | 'tiktok' | 'instagram' | null>(null);
  const [unconfiguredGuide, setUnconfiguredGuide] = useState<UnconfiguredGuide | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginUser(email, password);
    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      onAuthSuccess(result.user);
      onClose();
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = registerUser(name, email, password);
    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      onAuthSuccess(result.user);
      onClose();
    }
  };

  const handleSocialClick = async (provider: 'google' | 'tiktok' | 'instagram') => {
    setError(null);
    setSocialLoading(provider);
    try {
      const result = await loginWithOAuthProvider(provider);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else if (result.unconfigured) {
        const providerNames = {
          google: 'Google',
          tiktok: 'TikTok',
          instagram: 'Instagram',
        };
        setUnconfiguredGuide({
          provider,
          providerName: providerNames[provider],
          requiredEnvVars: result.requiredEnvVars || [],
          redirectUri: result.redirectUri || `${window.location.origin}/auth/callback`,
        });
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Не удалось выполнить вход через соцсеть');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleDemoSocial = async (provider: 'google' | 'tiktok' | 'instagram') => {
    setError(null);
    setSocialLoading(provider);
    try {
      const user = await demoSocialLogin(provider);
      onAuthSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Ошибка тестового входа');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    const res = loginUser(demoEmail, 'password123');
    if (res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  const handleGuest = () => {
    onAuthSuccess(GUEST_USER);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl transition-colors border max-h-[95vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-auth-modal"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {unconfiguredGuide
                ? `Настройка входа: ${unconfiguredGuide.providerName}`
                : tab === 'login'
                ? 'Вход в Noire-AI'
                : 'Создать аккаунт'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Синхронизация ваших чатов, истории и персональных настроек
            </p>
          </div>
        </div>

        {/* Unconfigured Provider Guide State */}
        {unconfiguredGuide ? (
          <div className="space-y-4 animate-in fade-in">
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-sky-400">
                <Key className="w-4 h-4" />
                Интеграция с {unconfiguredGuide.providerName}
              </div>
              <p className="mb-2">
                Для реальной авторизации через {unconfiguredGuide.providerName} добавьте ключи приложения в переменные окружения (.env или панель Secrets AI Studio):
              </p>
              <div className="font-mono text-[11px] p-2 rounded-lg bg-black/40 text-sky-300 mb-2.5 break-all">
                {unconfiguredGuide.requiredEnvVars.join('\n')}
              </div>
              <p className="text-[11px] mb-1">
                <strong>OAuth Callback URL (Redirect URI):</strong>
              </p>
              <div className="font-mono text-[11px] p-2 rounded-lg bg-black/40 text-emerald-300 break-all select-all">
                {unconfiguredGuide.redirectUri}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                id="demo-provider-login-btn"
                onClick={() => handleDemoSocial(unconfiguredGuide.provider)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Войти в тестовом аккаунте {unconfiguredGuide.providerName}
              </button>

              <button
                onClick={() => setUnconfiguredGuide(null)}
                className={`w-full py-2 px-4 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Вернуться назад
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Social Logins Buttons (Google, TikTok, Instagram) */}
            <div className="space-y-2 mb-5">
              <span className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Войти через социальные сети
              </span>

              {/* Google Button */}
              <button
                id="google-login-btn"
                type="button"
                disabled={socialLoading !== null}
                onClick={() => handleSocialClick('google')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-100 hover:border-slate-600'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center border border-slate-200">
                    <Chrome className="w-4 h-4 text-red-500" />
                  </div>
                  <span>Продолжить с Google</span>
                </div>
                {socialLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                ) : (
                  <span className={`text-[11px] font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Google OAuth
                  </span>
                )}
              </button>

              {/* TikTok Button */}
              <button
                id="tiktok-login-btn"
                type="button"
                disabled={socialLoading !== null}
                onClick={() => handleSocialClick('tiktok')}
                className={`w-full py-2.5 px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all cursor-pointer shadow-2xs ${
                  isDark
                    ? 'bg-black hover:bg-slate-950 border-slate-800 text-white hover:border-sky-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <span>Войти через TikTok</span>
                </div>
                {socialLoading === 'tiktok' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <span className="text-[11px] font-normal text-slate-400">
                    TikTok Login
                  </span>
                )}
              </button>

              {/* Instagram Button */}
              <button
                id="instagram-login-btn"
                type="button"
                disabled={socialLoading !== null}
                onClick={() => handleSocialClick('instagram')}
                className="w-full py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between text-white transition-all cursor-pointer shadow-sm bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 active:scale-99"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <span>Войти через Instagram</span>
                </div>
                {socialLoading === 'instagram' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span className="text-[11px] font-normal text-white/80">
                    Instagram ID
                  </span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-4">
              <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
              <span className={`flex-shrink mx-3 text-[11px] uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                или по email
              </span>
              <div className={`flex-grow border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
            </div>

            {/* Tabs */}
            <div className={`grid grid-cols-2 p-1 rounded-xl mb-4 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
              <button
                type="button"
                onClick={() => { setTab('login'); setError(null); }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'login'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Вход
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(null); }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'register'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Регистрация
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            {tab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email или Имя пользователя
                  </label>
                  <input
                    id="login-email-input"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@noire.ai"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Пароль
                  </label>
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                <button
                  id="submit-login-btn"
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-sky-500/20 active:scale-98 cursor-pointer"
                >
                  Войти по паролю
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Ваше имя
                  </label>
                  <input
                    id="register-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Константин"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email
                  </label>
                  <input
                    id="register-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Придумайте пароль
                  </label>
                  <input
                    id="register-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 4 символа"
                    className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm outline-none transition-colors border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                <button
                  id="submit-register-btn"
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-sky-500/20 active:scale-98 cursor-pointer"
                >
                  Зарегистрироваться
                </button>
              </form>
            )}

            {/* Quick Fast Logins */}
            <div className={`mt-5 pt-3.5 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'} space-y-2`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Быстрый тестовый вход (1 клик):
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoSocial('google')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Chrome className="w-3 h-3 text-red-500" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSocial('tiktok')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Music className="w-3 h-3 text-cyan-400" />
                  TikTok
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSocial('instagram')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    isDark
                      ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <Instagram className="w-3 h-3 text-pink-500" />
                  Instagram
                </button>
              </div>

              <div className="flex gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('alex@noire.ai')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  Алексей
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('elena@noire.ai')}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  Елена
                </button>
                <button
                  type="button"
                  onClick={handleGuest}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                >
                  Гость
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
